import sys
import os
sys.path.append(os.getcwd())

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import logging
import uvicorn
from typing import Dict, Any

# استيرادات الوكلاء (نتأكد من مسارها)
from backend.src.agents.critical.entity_extractor import EntityExtractorAgent
from backend.src.agents.critical.hadith_verifier import HadithVerifierAgent
from backend.src.agents.important.qa_agent import QAAgent
from backend.src.agents.important.scholar_profiler import ScholarProfilerAgent
from backend.src.agents.critical.semantic_search import SemanticSearchAgent
from backend.src.agents.advanced.concept_network_agent import ConceptNetworkAgent
from backend.data_access_layer import dal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("iqraa_brain")

# === Brain Class (Inline) ===
class BrainOrchestrator:
    def __init__(self):
        self.agents = {}
        try:
            self.agents['entity_extractor'] = EntityExtractorAgent()
            self.agents['hadith_verifier'] = HadithVerifierAgent()
            self.agents['qa_agent'] = QAAgent()
            self.agents['scholar_profiler'] = ScholarProfilerAgent()
            self.agents['semantic_search'] = SemanticSearchAgent()
            self.agents['concept_network'] = ConceptNetworkAgent()
            logger.info(f"🧠 Brain Initialized with {len(self.agents)} agents")
        except Exception as e:
            logger.error(f"⚠️ Brain Agent Load Error: {e}")

    async def process(self, query: str, agent_id: str = None) -> Dict:
        target_id = agent_id if agent_id else 'qa_agent'
        agent = self.agents.get(target_id)
        
        if not agent:
            return {"error": f"Agent {target_id} not found"}

        logger.info(f"🚀 Executing {target_id}")
        try:
            result = agent.run(query)
            return {
                "query": query,
                "agent_id": target_id,
                "result": result
            }
        except Exception as e:
            logger.error(f"❌ Execution Error: {e}")
            return {"error": str(e)}

brain = BrainOrchestrator()

# === App ===
app = FastAPI(title="IQRAA API V3 (Nuclear)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "IQRAA Brain V3 Active"}

@app.post("/api/brain/run")
async def run_brain(request: dict):
    return await brain.process(request.get("query"), request.get("agent"))

# Endpoints أخرى نحتاجها
@app.get("/api/entities/search")
async def search_entities(q: str = None, cat: str = None, limit: int = 50):
    return {"results": dal.search_entities(q, cat, limit)}

@app.get("/api/topics/stats")
async def get_topics_stats():
    # ... (نفس الكود السابق)
    return {"topics": []} # placeholder for now

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
