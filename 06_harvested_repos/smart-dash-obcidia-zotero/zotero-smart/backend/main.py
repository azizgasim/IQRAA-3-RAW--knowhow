"""
Zotero Smart - Main Application
زوتيرو الذكي - التطبيق الرئيسي
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database.db import init_database
from .routes import (
    references,
    collections,
    tags,
    annotations,
    search,
    citations,
    stats,
    import_export,
    integration
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    await init_database()
    yield


app = FastAPI(
    title="Zotero Smart API",
    description="زوتيرو الذكي - طبقة إدارة المراجع لمنصة إقرأ",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3002", "http://127.0.0.1:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(references.router)
app.include_router(collections.router)
app.include_router(tags.router)
app.include_router(annotations.router)
app.include_router(search.router)
app.include_router(citations.router)
app.include_router(stats.router)
app.include_router(import_export.router)
app.include_router(integration.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "Zotero Smart",
        "name_ar": "زوتيرو الذكي",
        "description": "طبقة إدارة المراجع لمنصة إقرأ",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002, reload=True)
