"""
Adapter: يلف SemanticSearchAgent القديم بواجهة async process()
لا يعدل الكود الأصلي
"""
from typing import Dict, Any
import logging
from backend.src.core.base_agent import BaseAgent, AgentCard, AgentInput, AgentOutput, AutonomyLevel, RiskTier
from backend.src.agents.critical.semantic_search import SemanticSearchAgent

logger = logging.getLogger(__name__)

class SemanticSearchAdapter(BaseAgent):
    def __init__(self):
        card = AgentCard(
            agent_id="A-SRCH-01",
            name="Semantic Search",
            name_ar="البحث الدلالي",
            description="Adapter: Vector search via DAL",
            category="critical",
            version="3.0",
            owner="system",
            autonomy_level=AutonomyLevel.L2,
            max_autonomy=AutonomyLevel.L3,
            risk_tier=RiskTier.R1
        )
        super().__init__(card)
        self._inner = SemanticSearchAgent()

    async def process(self, input_data: Any) -> Dict:
        text = input_data.get("text", "") if isinstance(input_data, dict) else str(input_data)
        if not text:
            return {"error": "No text provided"}
        
        logger.info(f"[SemanticSearch] Searching for: {text[:50]}")
        result = self._inner.run(text)
        
        return {
            "status": "success",
            "detected_lens": "semantic_search",
            "sources_count": result.get("results_count", 0),
            "sources": result.get("top_results", []),
            "result": {
                "epistemic_data": {"المفاهيم": [r.get("book", "") for r in result.get("top_results", [])]},
                "notepad": {"الملخص": f"تم العثور على {result.get('results_count', 0)} نص عبر البحث الدلالي"}
            }
        }

    def perceive(self, input: AgentInput) -> Dict: return {}
    def think(self, perception: Dict) -> Dict: return {}
    def act(self, plan: Dict) -> Dict: return {}
    def _build_output(self, input: AgentInput, result: Dict, duration: float) -> AgentOutput:
        return AgentOutput(content=str(result), metadata={"duration": duration})
