"""
Obsidia Backend - المفكرة الذكية الشخصية للباحث
FastAPI Application Entry Point

"ليست عقلاً بل وعياً بالعقل"

الفلسفة:
- طبقة فوق معرفية تُراقب تفكير الباحث وتُسجّله
- 25 وظيفة شخصية معتمدة
- تكامل محدود مع منصة إقرأ (6 نقاط فقط)
- BigQuery للتأمين فقط، لا تحليل
"""

import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.db import init_database
from routes import notes, tags, projects, search, cognitive, sync, integration


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - initialize database on startup"""
    await init_database()
    print("="*50)
    print("  Obsidia - المفكرة الذكية الشخصية للباحث")
    print("  'ليست عقلاً بل وعياً بالعقل'")
    print("="*50)
    print("  Server running on http://localhost:8001")
    print("  API Docs: http://localhost:8001/api/docs")
    print("="*50)
    yield


# Create FastAPI app
app = FastAPI(
    title="Obsidia API",
    description="""
    المفكرة الذكية الشخصية للباحث

    ## الفلسفة
    - **الشخصية**: كل ما في Obsidia ينتمي للباحث الفرد
    - **الامتداد**: تُسجّل ما يفكر فيه، لا ما يجب أن يفكر فيه
    - **الاستقلالية**: تعمل بكفاءة كاملة بدون المنصة

    ## الوظائف
    - 25 وظيفة معتمدة للملاحظات والمشاريع والبحث
    - المرآة المعرفية لتتبع الأنماط السلوكية
    - تكامل محدود مع منصة إقرأ (6 نقاط فقط)

    ## القواعد الذهبية
    1. المفكرة لا تستدعي LLM للتحليل
    2. المفكرة لا تُعيد كتابة المخرجات
    3. المفكرة لا تقترح حلولاً معرفية
    """,
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(notes.router, prefix="/api")
app.include_router(tags.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(cognitive.router, prefix="/api")
app.include_router(sync.router, prefix="/api")
app.include_router(integration.router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "Obsidia",
        "description": "المفكرة الذكية الشخصية للباحث",
        "philosophy": "ليست عقلاً بل وعياً بالعقل",
        "version": "1.0.0",
        "status": "running",
        "docs": "/api/docs"
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "obsidia"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        reload_dirs=["."]
    )
