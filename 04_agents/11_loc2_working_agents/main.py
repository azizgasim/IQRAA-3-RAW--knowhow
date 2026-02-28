import sys
import os
sys.path.append(os.getcwd())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import uvicorn

# استيرادات النظام النظيفة
from backend.src.core.brain_orchestrator import brain
from backend.data_access_layer import dal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("iqraa_api")

app = FastAPI(title="IQRAA API V3 (Clean)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "IQRAA Brain Active (Clean Architecture)"}

# --- Brain ---
@app.post("/api/brain/run")
async def run_brain(request: dict):
    return await brain.process(request.get("query"), request.get("agent"))

# --- Entities ---
@app.get("/api/entities/search")
async def search_entities(q: str = None, cat: str = None, limit: int = 50):
    return {"results": dal.search_entities(q, cat, limit)}

# --- Topics ---
@app.get("/api/topics/stats")
async def get_topics_stats():
    # ... (نفس الكود السابق للـ topics)
    return {"topics": []} # Placeholder until restored

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
