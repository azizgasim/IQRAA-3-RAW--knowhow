"""
IQRAA Dashboard Backend with Agents Integration
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from google.cloud import bigquery
import os

# استيراد الـ Orchestrator
try:
    from agents_orchestrator import AgentsOrchestrator
    AGENTS_ENABLED = True
    print("✅ تم تحميل منظومة الوكلاء")
except Exception as e:
    print(f"⚠️ الوكلاء غير متاحة: {e}")
    AGENTS_ENABLED = False

app = FastAPI(
    title="IQRAA Search API with Agents",
    description="البحث في 335 مليون نص مع منظومة الوكلاء الأكاديميين",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "iqraa-12")

DIWAN_TABLES = {
    "fiqh": {"table": "diwan_iqraa_v2.01_fiqh_rulings", "name": "الفقه", "count": 47194044},
    "hadith": {"table": "diwan_iqraa_v2.02_hadith_corpus", "name": "الحديث", "count": 41090793},
    "history": {"table": "diwan_iqraa_v2.03_timeline_events", "name": "التاريخ", "count": 38857627},
    "aqeedah": {"table": "diwan_iqraa_v2.04_kalam_schools", "name": "العقيدة", "count": 40886753},
    "usul": {"table": "diwan_iqraa_v2.05_usul_and_maqasid", "name": "الأصول", "count": 26245012},
    "geography": {"table": "diwan_iqraa_v2.06_geography_knowledge", "name": "الجغرافيا", "count": 24560582},
    "economy": {"table": "diwan_iqraa_v2.08_economy_segments", "name": "الاقتصاد", "count": 19401362},
    "sufism": {"table": "diwan_iqraa_v2.09_sufism_spirituality", "name": "التصوف", "count": 35360439},
    "philosophy": {"table": "diwan_iqraa_v2.10_philosophy_logic", "name": "الفلسفة", "count": 40884658},
    "politics": {"table": "diwan_iqraa_v2.11_rulers_segments", "name": "السياسة", "count": 21066228},
}

try:
    bq_client = bigquery.Client(project=PROJECT_ID)
    print(f"✅ BigQuery connected to {PROJECT_ID}")
except Exception as e:
    print(f"⚠️ BigQuery error: {e}")
    bq_client = None

# تهيئة منسق الوكلاء
if AGENTS_ENABLED:
    try:
        orchestrator = AgentsOrchestrator()
        print("✅ تم تهيئة منسق الوكلاء")
    except Exception as e:
        print(f"⚠️ فشل تهيئة الوكلاء: {e}")
        orchestrator = None
        AGENTS_ENABLED = False
else:
    orchestrator = None


class SearchRequest(BaseModel):
    query: str
    type: Optional[str] = "all"
    limit: Optional[int] = 20
    use_agents: Optional[bool] = True  # استخدام الوكلاء افتراضياً


@app.get("/")
async def root():
    total = sum(t["count"] for t in DIWAN_TABLES.values())
    return {
        "service": "IQRAA Search API with Agents",
        "status": "active",
        "total_documents": total,
        "bigquery_connected": bq_client is not None,
        "agents_enabled": AGENTS_ENABLED
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "agents": AGENTS_ENABLED
    }


@app.get("/api/v1/search/status")
async def search_status():
    total = sum(t["count"] for t in DIWAN_TABLES.values())
    return {
        "status": "active",
        "engine": "Iqraa Semantic Search with Agents",
        "total_documents": total,
        "bigquery_connected": True,
        "agents_enabled": AGENTS_ENABLED,
        "version": "2.0"
    }


@app.post("/ask")
@app.post("/api/ask")
async def ask_with_agents(request: dict):
    """
    المحادثة الذكية مع منظومة الوكلاء
    """
    try:
        query = request.get("query", "")
        use_agents = request.get("use_agents", True)
        
        if not query:
            return {"error": "Query is required"}
        
        # إذا كانت الوكلاء مفعّلة واستخدامها مطلوب
        if AGENTS_ENABLED and use_agents and orchestrator:
            print(f"🤖 معالجة عبر الوكلاء: {query}")
            
            # معالجة عبر منظومة الوكلاء
            agent_result = await orchestrator.process_query(
                query=query,
                context=request
            )
            
            return {
                "answer": agent_result.get("answer", ""),
                "results": agent_result.get("findings", []),
                "sources": agent_result.get("sources", []),
                "analysis": agent_result.get("analysis", {}),
                "network": agent_result.get("network", {}),
                "metadata": {
                    **agent_result.get("metadata", {}),
                    "processed_by": "agents",
                    "agents_used": [
                        "LinguistAgent",
                        "ResearchAgent", 
                        "AnalysisAgent",
                        "WritingAgent",
                        "ReviewerAgent"
                    ]
                },
                "total": len(agent_result.get("findings", [])),
                "query": query
            }
        
        else:
            # Fallback: البحث التقليدي في BigQuery
            print(f"🔍 بحث تقليدي: {query}")
            
            if not bq_client:
                return {"error": "BigQuery not connected"}
            
            results = []
            
            # البحث البسيط
            for domain in ["fiqh", "hadith", "aqeedah"]:
                table_info = DIWAN_TABLES[domain]
                table_name = table_info["table"]
                
                sql = f"""
                SELECT chunk_id, record_id, text, 
                FROM `{PROJECT_ID}.{table_name}`
                WHERE text LIKE @query
                LIMIT 10
                """
                
                job_config = bigquery.QueryJobConfig(
                    query_parameters=[
                        bigquery.ScalarQueryParameter("query", "STRING", f"%{query}%")
                    ]
                )
                
                query_job = bq_client.query(sql, job_config=job_config)
                rows = list(query_job.result())
                
                for row in rows:
                    results.append({
                        "id": row.chunk_id or "",
                        "title": row.record_id or "",
                        "excerpt": (row.text or "")[:500],
                        "type": table_info["name"],
                        "metadata": {
                            "chapter": "",
                            "school": ""
                        }
                    })
            
            return {
                "answer": f"تم العثور على {len(results)} نتيجة",
                "results": results,
                "total": len(results),
                "query": query,
                "metadata": {
                    "processed_by": "bigquery_direct"
                }
            }
    
    except Exception as e:
        print(f"❌ خطأ في /ask: {e}")
        import traceback
        traceback.print_exc()
        
        return {
            "error": str(e),
            "answer": "عذراً، حدث خطأ في معالجة السؤال",
            "results": [],
            "total": 0
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

