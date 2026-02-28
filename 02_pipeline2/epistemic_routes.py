from fastapi import APIRouter
from google.cloud import bigquery
from typing import Optional
import os

router = APIRouter(prefix="/api/epistemic", tags=["epistemic"])
PROJECT_ID = os.getenv("IQRAA_BQ_PROJECT", "iqraa-12")
DATASET = os.getenv("IQRAA_BQ_DATASET", "iqraa_academic_v2")
TABLE = os.getenv("IQRAA_BQ_TABLE", "unified_analysis")
TBL = f"{PROJECT_ID}.{DATASET}.{TABLE}"
bq = bigquery.Client(project=PROJECT_ID)

@router.get("/search")
async def search(q: str, limit: int = 10,
                 domain: Optional[str] = None,
                 lens: Optional[str] = None):
    terms = [t for t in q.strip().split() if len(t) > 1][:6]
    if not terms:
        return {"results": [], "total": 0}
    params = []
    conds = []
    for i, t in enumerate(terms):
        params.append(bigquery.ScalarQueryParameter(f"t{i}", "STRING", t))
        conds.append(f"(LOWER(value) LIKE LOWER(CONCAT('%', @t{i}, '%')) OR LOWER(evidence) LIKE LOWER(CONCAT('%', @t{i}, '%')))")
    where_terms = " OR ".join(conds)
    extra = []
    if domain:
        extra.append("epistemic_domain = @domain")
        params.append(bigquery.ScalarQueryParameter("domain", "STRING", domain))
    if lens:
        extra.append("epistemic_lens = @lens")
        params.append(bigquery.ScalarQueryParameter("lens", "STRING", lens))
    extra_sql = (" AND " + " AND ".join(extra)) if extra else ""
    params.append(bigquery.ScalarQueryParameter("limit", "INT64", limit))
    sql = f"""
        SELECT row_id, base_book AS book,
               epistemic_domain AS domain, epistemic_lens AS lens,
               field_name AS field, value AS text,
               evidence, confidence AS score
        FROM `{TBL}`
        WHERE ({where_terms}) {extra_sql}
          AND is_empty = FALSE AND confidence >= 0.70
        ORDER BY confidence DESC LIMIT @limit
    """
    try:
        job_config = bigquery.QueryJobConfig(query_parameters=params)
        rows = list(bq.query(sql, job_config=job_config).result())
        return {"query": q, "total": len(rows), "results": [dict(r) for r in rows]}
    except Exception as e:
        return {"error": str(e), "results": []}

@router.get("/term-history")
async def term_history(term: str):
    t = term.strip()
    sql = f"""
        SELECT base_book AS book, epistemic_lens AS lens,
               field_name AS field, value AS text,
               evidence, confidence AS score
        FROM `{TBL}`
        WHERE (LOWER(value) LIKE LOWER(CONCAT('%', @term, '%'))
               OR LOWER(evidence) LIKE LOWER(CONCAT('%', @term, '%')))
          AND is_empty = FALSE AND confidence >= 0.70
        ORDER BY confidence DESC LIMIT @limit
    """
    try:
        params = [
            bigquery.ScalarQueryParameter("term", "STRING", t),
            bigquery.ScalarQueryParameter("limit", "INT64", 100),
        ]
        job_config = bigquery.QueryJobConfig(query_parameters=params)
        rows = list(bq.query(sql, job_config=job_config).result())
        return {"term": term, "total": len(rows), "results": [dict(r) for r in rows]}
    except Exception as e:
        return {"error": str(e), "results": []}

@router.get("/books/{book_name}")
async def book_atoms(book_name: str, limit: int = 50):
    sql = f"""
        SELECT epistemic_domain AS domain, epistemic_lens AS lens,
               field_name AS field, value AS text,
               evidence, confidence AS score
        FROM `{TBL}`
        WHERE base_book LIKE CONCAT('%', @book, '%')
          AND is_empty = FALSE AND confidence >= 0.70
        ORDER BY confidence DESC LIMIT @limit
    """
    try:
        params = [
            bigquery.ScalarQueryParameter("book", "STRING", book_name),
            bigquery.ScalarQueryParameter("limit", "INT64", limit),
        ]
        job_config = bigquery.QueryJobConfig(query_parameters=params)
        rows = list(bq.query(sql, job_config=job_config).result())
        return {"book": book_name, "total": len(rows), "atoms": [dict(r) for r in rows]}
    except Exception as e:
        return {"error": str(e)}

@router.post("/save")
async def save_result(data: dict):
    from backend.lib.bq_memory import save_result as _save, create_project
    try:
        r = data.get("result", {})
        pid = data.get("project_id") or create_project(
            name=data.get("project_name", "بحث جديد"),
            question=data.get("query", "")
        )
        rid = _save(
            project_id=pid, row_id=r.get("row_id",""),
            book=r.get("book",""), domain=r.get("domain",""),
            lens=r.get("lens",""), field_name=r.get("field",""),
            value=r.get("text",""), evidence=r.get("evidence",""),
            confidence=float(r.get("score",0)),
            researcher_note=data.get("note",""),
            importance=data.get("importance","MEDIUM"),
        )
        return {"saved": True, "result_id": rid, "project_id": pid}
    except Exception as e:
        return {"error": str(e)}

@router.get("/projects")
async def list_projects():
    from backend.lib.bq_memory import list_projects as _list
    try:
        return {"projects": _list()}
    except Exception as e:
        return {"error": str(e)}
