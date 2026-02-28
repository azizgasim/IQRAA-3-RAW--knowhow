# 🤖 توجيهات محادثة الوكلاء (Backend)
## مع دروس آباء التصميم للـ Backend
### للنسخ واللصق مباشرة

---

```
═══════════════════════════════════════════════════════════════
     🎯 مهمة إنشاء FastAPI + تطبيق دروس الآباء
═══════════════════════════════════════════════════════════════

مرحباً! المطلوب:
1. إنشاء FastAPI يتصل بـ diwan_iqraa_elmi مباشرة (157M صف)
2. إضافة Report Generator
3. تطبيق دروس آباء التصميم للـ Backend

═══════════════════════════════════════════════════════════════
                الجزء 1: إنشاء FastAPI
═══════════════════════════════════════════════════════════════

1️⃣ أنشئ: backend/main.py

"""
IQRA-12 Backend API v2.1
FastAPI مع اتصال مباشر بـ diwan_iqraa_elmi
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from google.cloud import bigquery
from datetime import datetime
import asyncio
import hashlib

app = FastAPI(
    title="IQRA-12 API",
    description="Backend API - 157M+ Islamic texts",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════════════════════════
# BigQuery Client + Cache (درس Chen: الأداء مهم)
# ═══════════════════════════════════════════════════════════════

bq_client = bigquery.Client(project="iqraa-12")

# Cache بسيط للنتائج (درس Kaneko: احترم الأداء)
_cache: Dict[str, Any] = {}
_cache_ttl = 300  # 5 دقائق

def get_cache_key(query: str, corpus: str, limit: int) -> str:
    return hashlib.md5(f"{query}:{corpus}:{limit}".encode()).hexdigest()

# ═══════════════════════════════════════════════════════════════
# الجداول المتاحة
# ═══════════════════════════════════════════════════════════════

DIWAN_TABLES = {
    "fiqh": {
        "table": "iqraa-12.diwan_iqraa_elmi.01_fiqh_rulings",
        "count": 47194044,
        "icon": "📖",
        "label_ar": "الفقه"
    },
    "hadith": {
        "table": "iqraa-12.diwan_iqraa_elmi.02_hadith_corpus",
        "count": 41090793,
        "icon": "📜",
        "label_ar": "الحديث"
    },
    "timeline": {
        "table": "iqraa-12.diwan_iqraa_elmi.03_timeline_events",
        "count": 38857627,
        "icon": "🕐",
        "label_ar": "التاريخ"
    },
    "kalam": {
        "table": "iqraa-12.diwan_iqraa_elmi.04_kalam_schools",
        "count": 40886753,
        "icon": "💭",
        "label_ar": "الكلام"
    },
    "usul": {
        "table": "iqraa-12.diwan_iqraa_elmi.05_usul_and_maqasid",
        "count": 26245012,
        "icon": "⚖️",
        "label_ar": "الأصول"
    },
}

# ═══════════════════════════════════════════════════════════════
# Models (درس Friedman: عقود API واضحة)
# ═══════════════════════════════════════════════════════════════

class SearchRequest(BaseModel):
    query: str
    corpus: Optional[str] = "all"  # درس Chen: الافتراضي آمن
    limit: int = 20

class SearchResponse(BaseModel):
    success: bool
    query: str
    corpus: str
    results: List[Dict[str, Any]]
    total: int
    latency_ms: int
    cached: bool = False
    source: str = "diwan_iqraa_elmi"

class ReportRequest(BaseModel):
    research_question: str
    corpus: Optional[str] = None
    format: str = "MARKDOWN"

class PipelineRequest(BaseModel):
    query: str
    mode: str = "full"  # search | analyze | full

# ═══════════════════════════════════════════════════════════════
# Logging (درس Harris: Command logging للتحليلات)
# ═══════════════════════════════════════════════════════════════

async def log_search(query: str, corpus: str, results_count: int, latency_ms: int):
    """تسجيل البحث للتحليلات"""
    try:
        log_query = """
        INSERT INTO `iqraa-12.ops.search_logs` 
        (timestamp, query, corpus, results_count, latency_ms)
        VALUES (@ts, @query, @corpus, @count, @latency)
        """
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("ts", "TIMESTAMP", datetime.utcnow()),
                bigquery.ScalarQueryParameter("query", "STRING", query[:500]),
                bigquery.ScalarQueryParameter("corpus", "STRING", corpus),
                bigquery.ScalarQueryParameter("count", "INT64", results_count),
                bigquery.ScalarQueryParameter("latency", "INT64", latency_ms),
            ]
        )
        bq_client.query(log_query, job_config=job_config)
    except:
        pass  # لا تفشل العملية بسبب التسجيل

# ═══════════════════════════════════════════════════════════════
# البحث (درس Norman: تغذية راجعة فورية)
# ═══════════════════════════════════════════════════════════════

@app.post("/api/search", response_model=SearchResponse)
async def search(request: SearchRequest, background_tasks: BackgroundTasks):
    """
    البحث في diwan_iqraa_elmi
    يدعم: fiqh, hadith, kalam, usul, timeline, أو all
    """
    import time
    start_time = time.time()
    
    try:
        # فحص الـ Cache
        cache_key = get_cache_key(request.query, request.corpus, request.limit)
        if cache_key in _cache:
            cached = _cache[cache_key]
            if time.time() - cached["time"] < _cache_ttl:
                cached["data"]["cached"] = True
                return SearchResponse(**cached["data"])
        
        results = []
        
        # تحديد الجداول
        if request.corpus and request.corpus != "all":
            if request.corpus not in DIWAN_TABLES:
                raise HTTPException(
                    status_code=400, 
                    detail=f"مصدر غير معروف: {request.corpus}. المتاح: {list(DIWAN_TABLES.keys())}"
                )
            tables = {request.corpus: DIWAN_TABLES[request.corpus]}
        else:
            tables = DIWAN_TABLES
        
        # البحث في كل جدول
        limit_per_table = max(5, request.limit // len(tables))
        
        for corpus_name, corpus_info in tables.items():
            # محاولة SEARCH أولاً، ثم LIKE كبديل
            query = f"""
            SELECT 
                CAST(id AS STRING) as id,
                SUBSTR(content, 1, 500) as content,
                COALESCE(title, book_name, '') as title,
                COALESCE(author, '') as author,
                '{corpus_name}' as corpus,
                '{corpus_info["icon"]}' as corpus_icon,
                '{corpus_info["label_ar"]}' as corpus_label
            FROM `{corpus_info["table"]}`
            WHERE content LIKE CONCAT('%', @query, '%')
            LIMIT @limit
            """
            
            job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("query", "STRING", request.query),
                    bigquery.ScalarQueryParameter("limit", "INT64", limit_per_table),
                ]
            )
            
            try:
                job = bq_client.query(query, job_config=job_config)
                for row in job.result():
                    results.append({
                        "id": row.id,
                        "content": row.content,
                        "title": row.title,
                        "author": row.author,
                        "corpus": row.corpus,
                        "corpus_icon": row.corpus_icon,
                        "corpus_label": row.corpus_label,
                    })
            except Exception as e:
                # تسجيل الخطأ لكن لا تفشل (درس Chen: التسامح)
                print(f"Error searching {corpus_name}: {e}")
        
        # ترتيب وتحديد النتائج
        results = results[:request.limit]
        
        latency_ms = int((time.time() - start_time) * 1000)
        
        response_data = {
            "success": True,
            "query": request.query,
            "corpus": request.corpus,
            "results": results,
            "total": len(results),
            "latency_ms": latency_ms,
            "cached": False,
            "source": "diwan_iqraa_elmi"
        }
        
        # حفظ في الـ Cache
        _cache[cache_key] = {"data": response_data, "time": time.time()}
        
        # تسجيل في الخلفية (درس Harris: لا تبطئ الاستجابة)
        background_tasks.add_task(
            log_search, request.query, request.corpus, len(results), latency_ms
        )
        
        return SearchResponse(**response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        # درس Norman: رسالة خطأ مفيدة
        raise HTTPException(
            status_code=500, 
            detail=f"حدث خطأ في البحث. يرجى المحاولة مرة أخرى. ({str(e)[:100]})"
        )

# ═══════════════════════════════════════════════════════════════
# الإحصائيات (درس Friedman: الشفافية)
# ═══════════════════════════════════════════════════════════════

@app.get("/api/stats")
async def get_stats():
    """إحصائيات المصادر المتاحة"""
    stats = {
        "source": "diwan_iqraa_elmi",
        "corpora": {},
        "total_records": 0
    }
    
    for corpus_name, corpus_info in DIWAN_TABLES.items():
        stats["corpora"][corpus_name] = {
            "count": corpus_info["count"],
            "icon": corpus_info["icon"],
            "label_ar": corpus_info["label_ar"],
            "table": corpus_info["table"]
        }
        stats["total_records"] += corpus_info["count"]
    
    stats["total_formatted"] = f"{stats['total_records']:,}"
    
    return stats

# ═══════════════════════════════════════════════════════════════
# Pipeline (درس Harris: أوامر كـ Domain Actions)
# ═══════════════════════════════════════════════════════════════

@app.post("/api/pipeline")
async def run_pipeline(request: PipelineRequest, background_tasks: BackgroundTasks):
    """
    Pipeline كامل: بحث → تجميع → تقرير
    modes: search, analyze, full
    """
    import time
    start_time = time.time()
    
    results = {
        "query": request.query,
        "mode": request.mode,
        "stages": {}
    }
    
    try:
        # المرحلة 1: البحث
        if request.mode in ["search", "full"]:
            search_result = await search(
                SearchRequest(query=request.query, corpus="all", limit=10),
                background_tasks
            )
            results["stages"]["search"] = {
                "status": "success",
                "count": search_result.total,
                "results": search_result.results
            }
        
        # المرحلة 2: التقرير (للـ full)
        if request.mode == "full":
            search_results = results["stages"].get("search", {}).get("results", [])
            
            # تقرير بسيط
            report_lines = [
                f"# تقرير بحثي",
                f"## السؤال: {request.query}",
                "",
                f"تم البحث في {len(DIWAN_TABLES)} مصادر ({sum(t['count'] for t in DIWAN_TABLES.values()):,} نص)",
                "",
                "## النتائج",
                ""
            ]
            
            # تجميع حسب المصدر
            by_corpus = {}
            for r in search_results:
                corpus = r.get("corpus", "other")
                if corpus not in by_corpus:
                    by_corpus[corpus] = []
                by_corpus[corpus].append(r)
            
            for corpus, items in by_corpus.items():
                corpus_info = DIWAN_TABLES.get(corpus, {})
                icon = corpus_info.get("icon", "📄")
                label = corpus_info.get("label_ar", corpus)
                
                report_lines.append(f"### {icon} {label}")
                report_lines.append("")
                
                for i, item in enumerate(items[:3], 1):
                    content = item.get("content", "")[:200]
                    title = item.get("title", "")
                    author = item.get("author", "")
                    
                    report_lines.append(f"**{i}.** {content}...")
                    if title or author:
                        report_lines.append(f"   — *{title}* {'لـ ' + author if author else ''}")
                    report_lines.append("")
            
            report_lines.append("---")
            report_lines.append(f"*تم إنشاء التقرير في {datetime.now().strftime('%Y-%m-%d %H:%M')}*")
            
            results["stages"]["report"] = {
                "status": "success",
                "content": "\n".join(report_lines),
                "format": "MARKDOWN"
            }
        
        latency_ms = int((time.time() - start_time) * 1000)
        results["latency_ms"] = latency_ms
        results["success"] = True
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ═══════════════════════════════════════════════════════════════
# Health & Info (درس Chen: Diagnostics واضحة)
# ═══════════════════════════════════════════════════════════════

@app.get("/")
async def root():
    """معلومات API"""
    return {
        "name": "IQRA-12 API",
        "version": "2.1.0",
        "description": "منصة البحث في التراث الإسلامي",
        "data_source": "diwan_iqraa_elmi",
        "total_records": "157M+",
        "corpora": list(DIWAN_TABLES.keys()),
        "endpoints": {
            "search": "POST /api/search",
            "stats": "GET /api/stats",
            "pipeline": "POST /api/pipeline",
            "health": "GET /health"
        }
    }

@app.get("/health")
async def health():
    """فحص صحة النظام"""
    checks = {
        "api": True,
        "bigquery": False,
        "cache_size": len(_cache)
    }
    
    try:
        list(bq_client.query("SELECT 1").result())
        checks["bigquery"] = True
    except Exception as e:
        checks["bigquery_error"] = str(e)[:100]
    
    status = "healthy" if all([checks["api"], checks["bigquery"]]) else "degraded"
    
    return {
        "status": status,
        "checks": checks,
        "timestamp": datetime.utcnow().isoformat()
    }

# ═══════════════════════════════════════════════════════════════
# تشغيل
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

───────────────────────────────────────────────────────────────

2️⃣ حدّث: backend/requirements.txt

أضف:
fastapi>=0.104.0
uvicorn>=0.24.0
pydantic>=2.5.0
python-multipart>=0.0.6

───────────────────────────────────────────────────────────────

3️⃣ أنشئ جدول التسجيل (إذا لم يكن موجوداً):

CREATE TABLE IF NOT EXISTS `iqraa-12.ops.search_logs` (
  timestamp TIMESTAMP,
  query STRING,
  corpus STRING,
  results_count INT64,
  latency_ms INT64
);

═══════════════════════════════════════════════════════════════
     الجزء 2: دروس آباء التصميم للـ Backend
═══════════════════════════════════════════════════════════════

تم تضمينها في الكود أعلاه:

من Jon Friedman (Microsoft):
─────────────────────────────────────────
✅ "عقود API حول حالات المستخدم لا جداول قاعدة البيانات"
   → SearchRequest/SearchResponse واضحة ومفهومة

✅ "Feature Flags لتجارب A/B"
   → يمكن إضافة corpus جديد بسهولة

✅ "الخصوصية جزء من UX"
   → لا نسجل معلومات شخصية، فقط الاستعلام

───────────────────────────────────────────────────────────────

من Steve Kaneko (Windows):
─────────────────────────────────────────
✅ "احترم الأداء"
   → Cache للنتائج المتكررة

✅ "Source of Truth واضح"
   → diwan_iqraa_elmi هو المصدر الوحيد

✅ "عند الفشل، قدّم إجراء إصلاحي"
   → رسائل خطأ واضحة مع اقتراحات

───────────────────────────────────────────────────────────────

من Jensen Harris (Office):
─────────────────────────────────────────
✅ "Commands كـ Domain Actions"
   → كل endpoint له معنى واضح (search, pipeline, stats)

✅ "Command logging للتحليلات"
   → log_search() في الخلفية

✅ "نتيجة محددة لكل أمر"
   → success + error messages واضحة

───────────────────────────────────────────────────────────────

من Raymond Chen (Windows):
─────────────────────────────────────────
✅ "الافتراضي آمن"
   → corpus: "all", limit: 20

✅ "Race conditions"
   → Cache يحمي من طلبات متكررة

✅ "Backward compatibility"
   → API مستقر، إضافات لا تكسر القديم

✅ "أخطاء قابلة للنسخ"
   → تفاصيل الخطأ في الاستجابة

───────────────────────────────────────────────────────────────

من Don Norman (Apple):
─────────────────────────────────────────
✅ "تغذية راجعة فورية"
   → latency_ms في كل استجابة

✅ "التسامح: تأخير الشبكة لا يفسد الحالة"
   → Cache + Background tasks

✅ "حالة النظام مرئية"
   → /health endpoint مفصل

═══════════════════════════════════════════════════════════════
                الجزء 3: التشغيل والاختبار
═══════════════════════════════════════════════════════════════

4️⃣ تشغيل:

cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

───────────────────────────────────────────────────────────────

5️⃣ اختبار:

# فحص الصحة
curl http://localhost:8000/health

# الإحصائيات
curl http://localhost:8000/api/stats

# بحث بسيط
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "حكم الزكاة", "limit": 5}'

# بحث في مصدر محدد
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "صلاة الجماعة", "corpus": "fiqh", "limit": 10}'

# Pipeline كامل
curl -X POST http://localhost:8000/api/pipeline \
  -H "Content-Type: application/json" \
  -d '{"query": "أحكام الصيام", "mode": "full"}'

───────────────────────────────────────────────────────────────

6️⃣ رفع إلى GitHub:

git add .
git commit -m "feat: FastAPI backend with diwan_iqraa_elmi integration"
git push

═══════════════════════════════════════════════════════════════
                    📊 الملخص المطلوب
═══════════════════════════════════════════════════════════════

بعد التنفيذ، أرسل:

✅ الملفات:
   - [ ] main.py (FastAPI)
   - [ ] requirements.txt (محدث)

✅ الاختبارات:
   - [ ] /health: ✅/❌
   - [ ] /api/stats: ✅/❌
   - [ ] /api/search: ✅/❌
   - [ ] /api/pipeline: ✅/❌

✅ دروس الآباء المطبقة:
   - [ ] Cache (Kaneko)
   - [ ] Logging (Harris)
   - [ ] Error messages (Chen)
   - [ ] Latency tracking (Norman)

✅ GitHub:
   - [ ] تم الرفع

═══════════════════════════════════════════════════════════════

ملاحظة: الـ Dashboard جاهز للاتصال بـ port 8000.
بعد تشغيل الـ Backend، سنختبر التكامل معاً.

شكراً! 🚀
```
