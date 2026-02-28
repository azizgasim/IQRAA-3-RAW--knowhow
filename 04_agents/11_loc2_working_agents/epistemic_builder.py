from typing import Dict, Any
import logging
import json
from backend.src.core.base_agent import BaseAgent, AgentCard, AgentInput, AgentOutput, AutonomyLevel, RiskTier
from backend.src.core.model_client import model_client
from backend.src.agents.search.al_kashshaf import AlKashshaf
from backend.data_access_layer import dal

logger = logging.getLogger(__name__)
kashshaf = AlKashshaf()

class EpistemicBuilder(BaseAgent):
    def __init__(self):
        card = AgentCard(
            agent_id="A-EPI-01", name="Epistemic Builder",
            name_ar="المهندس المعرفي",
            description="RAG with Al-Kashshaf Semantic Search",
            category="advanced", version="5.0",
            owner="system",
            autonomy_level=AutonomyLevel.L3,
            max_autonomy=AutonomyLevel.L3,
            risk_tier=RiskTier.R2
        )
        super().__init__(card)

    async def process(self, input_data: Any) -> Dict:
        text = input_data.get("text", "") if isinstance(input_data, dict) else ""
        if not text: return {"error": "No text"}

        # الكشّاف يبحث
        search_result = kashshaf.search(text)
        context = search_result.get("context", "")
        sources = search_result.get("sources", [])

        if context:
            prompt = f"""أنت مؤرخ إسلامي ومحلل إبستمولوجي.
حلل السؤال بناءً على النصوص التراثية المرفقة.
السؤال: {text}
النصوص المرجعية ({len(sources)} نص):
{context[:4000]}
أجب بـ JSON. كل القيم بالعربية حصراً.
{{ "البيانات": {{ "المفاهيم": [], "الأعلام": [], "السياق": "" }}, "المفكرة": {{ "الملخص": "", "النقد": "", "الروابط": "" }} }}"""
        else:
            prompt = f"""أنت مؤرخ إسلامي. لم يُعثر على نصوص مرجعية. حلل السؤال من معرفتك.
السؤال: {text}
أجب بـ JSON بالعربية.
{{ "البيانات": {{ "المفاهيم": [], "الأعلام": [], "السياق": "" }}, "المفكرة": {{ "الملخص": "", "النقد": "", "الروابط": "" }} }}"""

        response = model_client.generate(prompt, model_name="models/gemini-2.0-flash")
        try:
            clean = response.strip()
            if "```json" in clean: clean = clean.split("```json")[1].split("```")[0]
            elif "```" in clean: clean = clean.split("```")[1].split("```")[0]
            data = json.loads(clean)
        except:
            data = {"المفكرة": {"الملخص": response}}

        # حفظ النتيجة في جدول المعرفة
        try:
            dal.save_interaction({
                "source_key": "epistemic_search",
                "agent_id": "A-EPI-01",
                "agent_name": "Epistemic Builder",
                "query": text,
                "response": str(data),
                "chunk_ids": [s.get("id", "") for s in sources],
                "confidence": 0.85
            })
        except: pass

        return {
            "status": "success",
            "detected_lens": "semantic_search",
            "sources_count": len(sources),
            "sources": sources,
            "result": {
                "epistemic_data": data.get("البيانات", {}),
                "notepad": data.get("المفكرة", {})
            }
        }

    def perceive(self, input: AgentInput) -> Dict: return {}
    def think(self, perception: Dict) -> Dict: return {}
    def act(self, plan: Dict) -> Dict: return {}
    def _build_output(self, input: AgentInput, result: Dict, duration: float) -> AgentOutput:
        return AgentOutput(content=str(result), metadata={"duration": duration})
