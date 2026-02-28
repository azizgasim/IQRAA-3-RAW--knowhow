import argparse
import logging
import json
import asyncio
import time
import os
from typing import List, Dict, Any

import apache_beam as beam
from apache_beam.options.pipeline_options import PipelineOptions, GoogleCloudOptions, WorkerOptions, SetupOptions
from apache_beam.io.gcp.internal.clients import bigquery
from google.cloud import secretmanager
import aiohttp

# ==========================================
# CONFIGURATION
# ==========================================
PROJECT_ID = "iqraa-12"
REGION = "us-central1"
OUTPUT_TABLE = f"{PROJECT_ID}:iqraa_academic_v2.iqraa_epistemic_core"

# ==========================================
# LOGIC: ASYNC ENRICHMENT
# ==========================================

class EnrichChunkFn(beam.DoFn):
    def setup(self):
        try:
            client = secretmanager.SecretManagerServiceClient()
            name = f"projects/{PROJECT_ID}/secrets/anthropic-api-key/versions/latest"
            response = client.access_secret_version(request={"name": name})
            self.api_key = response.payload.data.decode("UTF-8").strip()
            self.model = "claude-3-haiku-20240307"
        except Exception as e:
            logging.error(f"Failed to access Secret Manager: {e}")
            raise

    async def _call_claude_async(self, session, chunk_id, text):
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        
        system_prompt = "You are an expert in Islamic Epistemology. Analyze the text and extract key concepts."
        user_prompt = f"Text: {text}\n\nReturn ONLY a JSON object with keys: 'concepts' (list), 'summary' (string)."

        payload = {
            "model": self.model,
            "max_tokens": 1000,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_prompt}]
        }

        try:
            async with session.post(url, headers=headers, json=payload) as response:
                if response.status == 200:
                    result = await response.json()
                    content = result['content'][0]['text']
                    try:
                        json_content = json.loads(content)
                        return {
                            "chunk_id": chunk_id,
                            "status": "SUCCESS",
                            "enrichment": json.dumps(json_content),
                            "error": None
                        }
                    except json.JSONDecodeError:
                        return {
                            "chunk_id": chunk_id,
                            "status": "PARSE_ERROR",
                            "enrichment": None,
                            "error": content
                        }
                else:
                    error_text = await response.text()
                    return {
                        "chunk_id": chunk_id,
                        "status": "API_ERROR",
                        "enrichment": None,
                        "error": f"{response.status}: {error_text}"
                    }
        except Exception as e:
            return {
                "chunk_id": chunk_id,
                "status": "SYSTEM_ERROR",
                "enrichment": None,
                "error": str(e)
            }

    async def _process_batch_async(self, batch):
        async with aiohttp.ClientSession() as session:
            tasks = []
            for item in batch:
                tasks.append(self._call_claude_async(session, item['chunk_id'], item['text']))
            return await asyncio.gather(*tasks)

    def process(self, batch):
        # The batch comes as a list of dicts from GroupIntoBatches
        # We need to extract the actual data if it's wrapped
        actual_batch = batch
        if isinstance(batch, tuple): # If coming from GroupByKey/GroupIntoBatches with key
             actual_batch = list(batch[1])
        
        # Run async loop
        results = asyncio.run(self._process_batch_async(actual_batch))
        for res in results:
            yield res

# ==========================================
# PIPELINE DEFINITION
# ==========================================

def run(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument('--limit', type=int, default=5, help='Number of records to process')
    parser.add_argument('--runner', default='DirectRunner', help='DirectRunner or DataflowRunner')
    known_args, pipeline_args = parser.parse_known_args(argv)

    pipeline_options = PipelineOptions(pipeline_args)
    
    google_cloud_options = pipeline_options.view_as(GoogleCloudOptions)
    google_cloud_options.project = PROJECT_ID
    google_cloud_options.region = REGION
    google_cloud_options.job_name = f"iqraa-enrichment-{int(time.time())}"
    google_cloud_options.staging_location = f"gs://iqraa-dataflow-staging/staging"
    google_cloud_options.temp_location = f"gs://iqraa-dataflow-temp/temp"

    worker_options = pipeline_options.view_as(WorkerOptions)
    worker_options.use_public_ips = False

    setup_options = pipeline_options.view_as(SetupOptions)
    setup_options.save_main_session = True
    setup_options.requirements_file = 'requirements.txt'

    # Dynamic Query
    query = f"""
    SELECT chunk_id, text 
    FROM `iqraa-12.diwan_iqraa_v2.openiti_chunks`
    WHERE token_count BETWEEN 50 AND 2000
    LIMIT {known_args.limit}
    """

    # BigQuery Schema
    table_schema = {
        'fields': [
            {'name': 'chunk_id', 'type': 'STRING', 'mode': 'REQUIRED'},
            {'name': 'status', 'type': 'STRING', 'mode': 'REQUIRED'},
            {'name': 'enrichment', 'type': 'JSON', 'mode': 'NULLABLE'},
            {'name': 'error', 'type': 'STRING', 'mode': 'NULLABLE'},
            {'name': 'processed_at', 'type': 'TIMESTAMP', 'mode': 'NULLABLE'} # Changed to NULLABLE for safety
        ]
    }

    logging.info(f"🚀 Starting Pipeline with runner: {known_args.runner}")
    logging.info(f"Query: {query}")

    with beam.Pipeline(options=pipeline_options) as p:
        (
            p
            | 'ReadFromBigQuery' >> beam.io.ReadFromBigQuery(
                query=query,
                use_standard_sql=True,
                project=PROJECT_ID,
                gcs_location=f"gs://iqraa-dataflow-temp/bq_read"
            )
            # Add a dummy key to group all elements into batches
            | 'AddDummyKey' >> beam.Map(lambda x: (1, x))
            | 'BatchElements' >> beam.GroupIntoBatches(batch_size=2) # Small batch for local test
            | 'ExtractBatch' >> beam.Map(lambda x: x[1]) # Extract list of items
            | 'EnrichWithClaude' >> beam.ParDo(EnrichChunkFn())
            | 'AddTimestamp' >> beam.Map(lambda x: {**x, 'processed_at': time.time()})
            | 'WriteToBigQuery' >> beam.io.WriteToBigQuery(
                OUTPUT_TABLE,
                schema=table_schema,
                write_disposition=beam.io.BigQueryDisposition.WRITE_APPEND,
                create_disposition=beam.io.BigQueryDisposition.CREATE_IF_NEEDED,
                method=beam.io.WriteToBigQuery.Method.FILE_LOADS
            )
        )

if __name__ == '__main__':
    logging.getLogger().setLevel(logging.INFO)
    run()
