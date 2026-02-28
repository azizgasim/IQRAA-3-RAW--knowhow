"""
Epistemic Agent v1.0
وكيل التوزيع الذري الإبستمولوجي
يدمج: quality_gate + lineage + taxonomy + Vertex AI Batch
"""
import sys
sys.path.insert(0, '/home/user/iqraa-12/backend/src/lib')

import json, uuid, time, logging
from datetime import datetime, timezone
from typing import Optional
from google.cloud import bigquery, storage, aiplatform

from quality_gate import QualityGate, QualityThresholds, QualityError
from lineage import LineageTracker

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

PROJECT = "iqraa-12"
REGION  = "us-central1"
MODEL   = "gemini-2.5-flash"

SYSTEM_FIELDS = {
    "text_segment_id","source_record_id","primary_text","segment_identifier",
    "text_type","text_subtype","text_lemmatized","text_roots","pos_tags",
    "morphological_features","syntactic_structure","ocr_confidence",
    "quality_score","view_count","citation_count","cited_by","cites",
    "model_name","run_id","classified_at","updated_at","text_content"
}


class EpistemicAgent:
    """
    وكيل التوزيع الذري الإبستمولوجي

    المهام:
    1. بناء الـ Prompt من الـ taxonomy
    2. رفع JSONL لـ GCS
    3. تشغيل Vertex AI Batch
    4. تحميل النتائج في BQ
    5. تطبيق Quality Gate
    6. تسجيل lineage

    الاستخدام:
        agent = EpistemicAgent()
        agent.run_campaign(
            campaign_id="epistemic_v1",
            chunks_table="golden_test_100",
            output_table="unified_analysis"
        )
    """

    def __init__(
        self,
        project:    str = PROJECT,
        region:     str = REGION,
        model:      str = MODEL,
        prompt_ver: str = "v2.0",
        thresholds: Optional[QualityThresholds] = None
    ):
        self.project     = project
        self.region      = region
        self.model       = model
        self.prompt_ver  = prompt_ver
        self.bq          = bigquery.Client(project=project)
        self.gcs         = storage.Client()
        self.gate        = QualityGate(thresholds or QualityThresholds(
            max_null_pct          = 0.95,
            min_confidence_avg    = 0.50,
            min_fields_filled_pct = 0.05,
            max_hallucinated_fields = 0.02,
            min_evidence_pct      = 0.70,
            budget_limit_usd      = 100.0
        ))
        self.lineage     = LineageTracker(self.bq, project)
        self.valid_domains = self._load_valid_domains()
        self.taxonomy    = self._load_taxonomy()
        self.field_map   = self._build_field_map()
        self.system_prompt = self._build_prompt()
        log.info(f"✅ EpistemicAgent جاهز | {len(self.field_map)} حقل")

    def _load_valid_domains(self) -> set:
        rows = self.bq.query("""
            SELECT DISTINCT epistemic_domain
            FROM `iqraa-12.iqraa_academic_v2.iqraa_epistemic_taxonomy`
        """).result()
        return {r.epistemic_domain for r in rows}

    def _load_taxonomy(self) -> dict:
        rows = list(self.bq.query(f"""
            SELECT epistemic_domain, epistemic_lens, field_name, field_description
            FROM `{self.project}.iqraa_academic_v2.iqraa_epistemic_taxonomy`
            WHERE field_name NOT IN UNNEST([{','.join(f"'{f}'" for f in SYSTEM_FIELDS)}])
            ORDER BY epistemic_domain, epistemic_lens, field_name
        """).result())
        taxonomy = {}
        for r in rows:
            d, l = r.epistemic_domain, r.epistemic_lens
            if d not in taxonomy: taxonomy[d] = {}
            if l not in taxonomy[d]: taxonomy[d][l] = []
            taxonomy[d][l].append({
                "field": r.field_name,
                "desc":  r.field_description or ""
            })
        return taxonomy

    def _build_field_map(self) -> dict:
        fmap = {}
        for d, lenses in self.taxonomy.items():
            for l, fields in lenses.items():
                for f in fields:
                    fmap[f["field"]] = {
                        "domain": d,
                        "lens":   l,
                        "desc":   f["desc"]
                    }
        return fmap

    def _build_prompt(self) -> str:
        domains = sorted(self.valid_domains)
        lines   = [
            "أنت جهاز رصد إبستمولوجي للتراث الإسلامي.",
            "مهمتك: استخراج الذرات المعرفية المخفية في النص.",
            "",
            "⚠️ قواعد صارمة:",
            f"1. epistemic_domain من هذه القائمة فقط:",
            "   [" + " | ".join(f'"{d}"' for d in domains) + "]",
            "2. epistemic_lens = LENS_ID من القائمة أدناه",
            "3. evidence اقتباس مباشر — إلزامي",
            "4. لا تخترع — الفراغ أفضل",
            ""
        ]
        for domain, lenses in self.taxonomy.items():
            lines.append(f"\n## DOMAIN: \"{domain}\"")
            for lens, fields in lenses.items():
                lines.append(f"### [{lens}]")
                for f in fields:
                    desc = f" ← {f['desc']}" if f["desc"] else ""
                    lines.append(f"  {f['field']}{desc}")
        lines += [
            "",
            '{"fields":[{"field_name":"...","epistemic_lens":"[LENS_ID]",'
            '"epistemic_domain":"DOMAIN","value":"...","evidence":"...","confidence":0.0}]}'
        ]
        return "\n".join(lines)

    def build_jsonl(
        self,
        chunks: list,
        output_bucket: str,
        output_blob:   str
    ) -> str:
        """بناء JSONL ورفعه لـ GCS"""
        jsonl_lines = []
        for chunk in chunks:
            req = {
                "custom_id": chunk["chunk_id"],
                "request": {
                    "contents": [{"role": "user", "parts": [{
                        "text": f"{self.system_prompt}\n\nالنص:\n\n{chunk['text']}"
                    }]}],
                    "generationConfig": {
                        "temperature":       0.1,
                        "maxOutputTokens":   65536,
                        "responseMimeType":  "application/json"
                    }
                }
            }
            jsonl_lines.append(json.dumps(req, ensure_ascii=False))

        content = "\n".join(jsonl_lines)
        bucket  = self.gcs.bucket(output_bucket)
        blob    = bucket.blob(output_blob)
        blob.upload_from_string(content, content_type="application/jsonl")

        gcs_uri = f"gs://{output_bucket}/{output_blob}"
        log.info(f"✅ JSONL: {len(jsonl_lines)} طلب | {len(content)/1024:.1f} KB → {gcs_uri}")
        return gcs_uri

    def launch_batch(
        self,
        input_uri:  str,
        output_uri: str,
        job_name:   str
    ) -> str:
        """إطلاق Vertex AI Batch Job"""
        aiplatform.init(project=self.project, location=self.region)
        client = aiplatform.gapic.JobServiceClient(
            client_options={"api_endpoint": f"{self.region}-aiplatform.googleapis.com"}
        )
        job = {
            "display_name": job_name,
            "model":        f"publishers/google/models/{self.model}",
            "input_config": {
                "instances_format": "jsonl",
                "gcs_source":       {"uris": [input_uri]}
            },
            "output_config": {
                "predictions_format": "jsonl",
                "gcs_destination":    {"output_uri_prefix": output_uri}
            },
        }
        response = client.create_batch_prediction_job(
            parent=f"projects/{self.project}/locations/{self.region}",
            batch_prediction_job=job
        )
        JOB_ID = response.name.split("/")[-1]
        log.info(f"✅ Batch Job: {JOB_ID}")

        # انتظار الاكتمال
        states = {1:"QUEUED",2:"PENDING",3:"RUNNING",4:"SUCCEEDED",5:"FAILED",7:"CANCELLED"}
        while True:
            job_status = client.get_batch_prediction_job(name=response.name)
            state      = states.get(job_status.state, str(job_status.state))
            log.info(f"  [{time.strftime('%H:%M:%S')}] {state}")
            if job_status.state in (4, 5, 7):
                if job_status.state != 4:
                    raise RuntimeError(f"Batch Job {state}: {job_status.error.message}")
                break
            time.sleep(60)

        return output_uri

    def load_results(
        self,
        output_uri:    str,
        output_table:  str,
        campaign_id:   str,
        chunks_map:    dict,
        run_id:        str
    ) -> dict:
        """تحميل نتائج GCS → BQ مع Quality Gate"""
        bucket_name = output_uri.replace("gs://","").split("/")[0]
        prefix      = "/".join(output_uri.replace("gs://","").split("/")[1:])

        bucket = self.gcs.bucket(bucket_name)
        blobs  = [b for b in bucket.list_blobs(prefix=prefix)
                  if b.name.endswith(".jsonl")]
        log.info(f"✅ {len(blobs)} ملف JSONL للمعالجة")

        total_parsed = total_fields = hallucinated = truncated = 0
        rows_to_insert = []
        now = datetime.now(timezone.utc).isoformat()

        for blob in blobs:
            for line in blob.download_as_text().splitlines():
                if not line.strip(): continue
                try:
                    obj      = json.loads(line)
                    chunk_id = obj.get("custom_id","")
                    response = obj.get("response",{})
                    meta     = chunks_map.get(chunk_id,{})

                    if not response.get("candidates"): continue

                    txt = response["candidates"][0]["content"]["parts"][0]["text"].strip()
                    if txt.startswith("```"):
                        txt = txt.split("```")[1]
                        if txt.startswith("json"): txt = txt[4:]

                    raw    = json.loads(txt)
                    fields = raw.get("fields",[]) if isinstance(raw,dict) else raw

                    in_tok  = response.get("usageMetadata",{}).get("promptTokenCount",0)
                    out_tok = response.get("usageMetadata",{}).get("candidatesTokenCount",0)
                    cost    = (in_tok*0.075 + out_tok*0.30) / 1_000_000

                    for f in fields:
                        fname  = f.get("field_name","").strip()
                        lens   = f.get("epistemic_lens","").strip().strip("[]")
                        domain = f.get("epistemic_domain","").strip()
                        if not fname: continue
                        if domain not in self.valid_domains: hallucinated += 1
                        fmeta = self.field_map.get(fname,{})
                        rows_to_insert.append({
                            "row_id":           str(uuid.uuid4()),
                            "super_chunk_id":   chunk_id,
                            "chunk_ids":        [chunk_id],
                            "record_id":        meta.get("record_id",""),
                            "base_book":        meta.get("base_book",""),
                            "campaign_id":      campaign_id,
                            "batch_id":         1,
                            "batch_field_start":1,
                            "batch_field_end":  len(self.field_map),
                            "epistemic_domain": domain,
                            "epistemic_lens":   lens,
                            "field_name":       fname,
                            "field_description":fmeta.get("desc","")[:500],
                            "value":            str(f.get("value",""))[:3000],
                            "evidence":         str(f.get("evidence",""))[:1000],
                            "confidence":       float(f.get("confidence",0.0)),
                            "is_empty":         False,
                            "input_tokens":     in_tok,
                            "output_tokens":    out_tok,
                            "cost_usd":         round(cost/max(len(fields),1),8),
                            "model":            self.model,
                            "prompt_version":   self.prompt_ver,
                            "analyzed_at":      now,
                        })
                        total_fields += 1
                    total_parsed += 1
                    # lineage لكل chunk
                    self.lineage.record_chunk(
                        run_id=run_id, campaign_id=campaign_id,
                        chunk_id=chunk_id, book=meta.get("record_id",""),
                        fields_filled=len(fields), cost_usd=cost,
                        quality_score=0.0, model=self.model
                    )
                except json.JSONDecodeError:
                    truncated += 1
                except Exception as e:
                    log.warning(f"⚠️ {e}")

        # Quality Gate
        gate_result = self.gate.check_batch(rows_to_insert)
        log.info(gate_result.summary())
        if not gate_result.passed:
            log.warning("Quality Gate فشل — البيانات ستُكتب مع تحذير")

        # كتابة BQ
        written = 0
        for i in range(0, len(rows_to_insert), 500):
            errors = self.bq.insert_rows_json(
                f"{self.project}.iqraa_academic_v2.{output_table}",
                rows_to_insert[i:i+500]
            )
            if not errors: written += len(rows_to_insert[i:i+500])

        stats = {
            "parsed":      total_parsed,
            "fields":      total_fields,
            "written":     written,
            "hallucinated":hallucinated,
            "truncated":   truncated,
            "quality":     gate_result.score,
            "passed":      gate_result.passed,
        }
        log.info(f"✅ {written:,} صف | score={gate_result.score:.2f}")
        return stats

    def run_campaign(
        self,
        campaign_id:   str,
        chunks_table:  str,
        output_table:  str  = "unified_analysis",
        gcs_bucket:    str  = "iqraa-12-batch-staging",
        max_chunks:    int  = None
    ):
        """تشغيل حملة كاملة من البداية للنهاية"""
        log.info(f"🚀 بدء حملة: {campaign_id}")
        run_id = self.lineage.start_run(
            job_name    = "epistemic_agent",
            campaign_id = campaign_id,
            model       = self.model,
            version     = self.prompt_ver
        )

        # جلب الـ chunks
        limit_clause = f"LIMIT {max_chunks}" if max_chunks else ""
        chunks = list(self.bq.query(f"""
            SELECT chunk_id, record_id, base_book, chunk_index, token_count, text
            FROM `{self.project}.iqraa_academic_v2.{chunks_table}`
            ORDER BY record_id, chunk_index
            {limit_clause}
        """).result())
        chunks_map = {c.chunk_id: dict(c) for c in chunks}
        chunks_list = [dict(c) for c in chunks]
        log.info(f"📖 {len(chunks_list)} chunk")

        # رفع JSONL
        ts       = int(time.time())
        blob     = f"epistemic/{campaign_id}/{ts}/input.jsonl"
        out_uri  = f"gs://{gcs_bucket}/epistemic/{campaign_id}/{ts}/output/"
        input_uri = self.build_jsonl(chunks_list, gcs_bucket, blob)

        # Batch
        output_uri = self.launch_batch(
            input_uri  = input_uri,
            output_uri = out_uri,
            job_name   = f"iqraa-{campaign_id}-{ts}"
        )

        # تحميل النتائج
        stats = self.load_results(
            output_uri   = output_uri,
            output_table = output_table,
            campaign_id  = campaign_id,
            chunks_map   = chunks_map,
            run_id       = run_id
        )

        # إنهاء lineage
        self.lineage.end_run(
            run_id        = run_id,
            campaign_id   = campaign_id,
            job_name      = "epistemic_agent",
            success       = stats["passed"],
            rows_written  = stats["written"],
            total_cost    = sum(r.get("cost_usd",0) for r in []),
            quality_score = stats["quality"]
        )

        log.info(f"🎉 اكتملت: {campaign_id}")
        log.info(f"   {stats}")
        return stats
