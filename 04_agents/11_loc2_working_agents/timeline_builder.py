from typing import Dict, Any
import logging
from google.cloud import bigquery
from backend.src.core.base_agent import BaseAgent, AgentCard, AgentInput, AgentOutput, AutonomyLevel, RiskTier

logger = logging.getLogger(__name__)

class TimelineBuilder(BaseAgent):
    def __init__(self):
        card = AgentCard(
            agent_id="A-TIME-01",
            name="Timeline Builder",
            name_ar="بانٍ الخط الزمني",
            description="Visualizes events from the timeline database.",
            category="important",
            version="2.1",
            owner="system",
            autonomy_level=AutonomyLevel.L2,
            max_autonomy=AutonomyLevel.L3,
            risk_tier=RiskTier.R1
        )
        super().__init__(card)
        self.client = bigquery.Client()

    async def process(self, input_data: Any) -> Dict:
        logger.info("Building Timeline...")
        
        # استعلام لجلب الأحداث المتوفرة
        sql = """
            SELECT year, event_type, description, entity_id 
            FROM `iqraa-12.iqraa_academic_v2.iqraa_timeline_events`
            ORDER BY year ASC
            LIMIT 50
        """
        
        try:
            results = list(self.client.query(sql).result())
            events = [
                {"year": r.year, "type": r.event_type, "desc": r.description, "entity": r.entity_id}
                for r in results
            ]
            return {
                "status": "success", 
                "visualizations": {
                    "timeline": events, 
                    "count": len(events)
                }
            }
        except Exception as e:
            logger.error(f"BQ Error: {e}")
            return {"error": str(e)}

    # Abstracts
    def perceive(self, input: AgentInput) -> Dict: return {}
    def think(self, perception: Dict) -> Dict: return {}
    def act(self, plan: Dict) -> Dict: return {}
    def _build_output(self, input: AgentInput, result: Dict, duration: float) -> AgentOutput:
         return AgentOutput(content=str(result), metadata={"duration": duration})
