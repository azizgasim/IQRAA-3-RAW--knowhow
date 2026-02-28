"""
IQRA-12 BigQuery Client
"""
from datetime import datetime
from typing import Any, Optional
from uuid import uuid4

from google.cloud import bigquery
from google.cloud.exceptions import NotFound
import structlog

from .config import Config

logger = structlog.get_logger()


class BigQueryClient:
    """عميل BigQuery المركزي لإقرأ-12"""
    
    def __init__(self, config: Optional[Config] = None):
        self.config = config or Config.from_env()
        self.client = bigquery.Client(project=self.config.project_id)
        self.logger = logger.bind(component="BigQueryClient")
        
    async def search_passages_text(
        self,
        query: str,
        corpus_scope: Optional[list[str]] = None,
        limit: int = 100,
    ) -> list[dict[str, Any]]:
        """E1: Text Search"""
        self.logger.info("text_search_started", query=query[:50])
        
        table = f"{self.config.project_id}.{self.config.unified_dataset}.{self.config.passages_table}"
        
        sql = f"""
        SELECT 
            passage_id, source_type, original_id, text, work_id, author_id, indexed_at
        FROM `{table}`
        WHERE SEARCH(text, @query)
        LIMIT @limit
        """
        
        params = [
            bigquery.ScalarQueryParameter("query", "STRING", query),
            bigquery.ScalarQueryParameter("limit", "INT64", min(limit, self.config.max_query_limit)),
        ]
        
        job_config = bigquery.QueryJobConfig(query_parameters=params)
        
        try:
            results = list(self.client.query(sql, job_config=job_config))
            self.logger.info("text_search_completed", result_count=len(results))
            return [dict(row) for row in results]
        except Exception as e:
            self.logger.error("text_search_failed", error=str(e))
            raise
    
    async def create_run(
        self,
        project_id: str,
        recipe_id: Optional[str] = None,
        corpus_scope: Optional[list[str]] = None,
        question: Optional[str] = None,
        cost_budget_usd: float = 1.0,
    ) -> str:
        """Create new run"""
        run_id = str(uuid4())
        
        table = f"{self.config.project_id}.{self.config.ops_dataset}.runs"
        
        sql = f"""
        INSERT INTO `{table}`
        (run_id, project_id, recipe_id, corpus_scope, question, status, cost_budget_usd, created_at)
        VALUES
        (@run_id, @project_id, @recipe_id, @corpus_scope, @question, 'pending', @cost_budget, CURRENT_TIMESTAMP())
        """
        
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("run_id", "STRING", run_id),
                bigquery.ScalarQueryParameter("project_id", "STRING", project_id),
                bigquery.ScalarQueryParameter("recipe_id", "STRING", recipe_id),
                bigquery.ArrayQueryParameter("corpus_scope", "STRING", corpus_scope or []),
                bigquery.ScalarQueryParameter("question", "STRING", question),
                bigquery.ScalarQueryParameter("cost_budget", "FLOAT64", cost_budget_usd),
            ]
        )
        
        self.client.query(sql, job_config=job_config).result()
        self.logger.info("run_created", run_id=run_id)
        return run_id
    
    async def update_run_status(self, run_id: str, status: str, cost_actual_usd: Optional[float] = None) -> None:
        """Update run status"""
        table = f"{self.config.project_id}.{self.config.ops_dataset}.runs"
        
        sql = f"""
        UPDATE `{table}`
        SET status = @status, cost_actual_usd = COALESCE(@cost, cost_actual_usd),
            completed_at = CASE WHEN @status IN ('completed', 'failed') THEN CURRENT_TIMESTAMP() ELSE completed_at END
        WHERE run_id = @run_id
        """
        
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("run_id", "STRING", run_id),
                bigquery.ScalarQueryParameter("status", "STRING", status),
                bigquery.ScalarQueryParameter("cost", "FLOAT64", cost_actual_usd),
            ]
        )
        
        self.client.query(sql, job_config=job_config).result()
    
    async def create_evidence_bundle(self, run_id: str, project_id: str, query: str) -> str:
        """Create evidence bundle"""
        bundle_id = str(uuid4())
        table = f"{self.config.project_id}.{self.config.evidence_dataset}.bundles"
        
        sql = f"""
        INSERT INTO `{table}` (bundle_id, run_id, project_id, query, status, created_at)
        VALUES (@bundle_id, @run_id, @project_id, @query, 'draft', CURRENT_TIMESTAMP())
        """
        
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("bundle_id", "STRING", bundle_id),
                bigquery.ScalarQueryParameter("run_id", "STRING", run_id),
                bigquery.ScalarQueryParameter("project_id", "STRING", project_id),
                bigquery.ScalarQueryParameter("query", "STRING", query),
            ]
        )
        
        self.client.query(sql, job_config=job_config).result()
        return bundle_id
    
    async def add_evidence_item(
        self,
        bundle_id: str,
        passage_id: str,
        offset_start: int,
        offset_end: int,
        text_snippet: str,
        relevance_score: float = 0.0,
    ) -> str:
        """Add evidence item - Non-negotiable: must have offsets"""
        if offset_start is None or offset_end is None:
            raise ValueError("Evidence must have offsets (non-negotiable rule)")
        
        evidence_id = str(uuid4())
        table = f"{self.config.project_id}.{self.config.evidence_dataset}.items"
        
        sql = f"""
        INSERT INTO `{table}`
        (evidence_id, bundle_id, passage_id, offset_start, offset_end, text_snippet, relevance_score, created_at)
        VALUES (@evidence_id, @bundle_id, @passage_id, @offset_start, @offset_end, @text_snippet, @relevance_score, CURRENT_TIMESTAMP())
        """
        
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("evidence_id", "STRING", evidence_id),
                bigquery.ScalarQueryParameter("bundle_id", "STRING", bundle_id),
                bigquery.ScalarQueryParameter("passage_id", "STRING", passage_id),
                bigquery.ScalarQueryParameter("offset_start", "INT64", offset_start),
                bigquery.ScalarQueryParameter("offset_end", "INT64", offset_end),
                bigquery.ScalarQueryParameter("text_snippet", "STRING", text_snippet),
                bigquery.ScalarQueryParameter("relevance_score", "FLOAT64", relevance_score),
            ]
        )
        
        self.client.query(sql, job_config=job_config).result()
        return evidence_id
    
    def get_table_schema(self, dataset: str, table: str) -> list[dict]:
        """Get table schema"""
        try:
            table_ref = self.client.get_table(f"{self.config.project_id}.{dataset}.{table}")
            return [{"name": f.name, "type": f.field_type} for f in table_ref.schema]
        except NotFound:
            return []
    
    def table_exists(self, dataset: str, table: str) -> bool:
        """Check if table exists"""
        try:
            self.client.get_table(f"{self.config.project_id}.{dataset}.{table}")
            return True
        except NotFound:
            return False
