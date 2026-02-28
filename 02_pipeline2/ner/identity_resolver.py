"""
═══════════════════════════════════════════════════════════════════════════
IQRA-12 Identity Resolver Agent (LINK-002)
═══════════════════════════════════════════════════════════════════════════
حل التباس هويات الكيانات (الغزالي = أبو حامد الغزالي = حجة الإسلام)
═══════════════════════════════════════════════════════════════════════════
"""

from typing import Dict, Any, List

from backend.agents.base.agent import LinkAgent, AgentConfig, AgentResult, AgentCategory


# قاعدة بيانات الأسماء البديلة
ALIAS_DB = {
    "الغزالي": {"canonical": "أبو حامد الغزالي", "scholar_id": "SCH-0505", "death_year": 505, "aliases": ["حجة الإسلام", "الغزالي", "أبو حامد"]},
    "ابن تيمية": {"canonical": "تقي الدين ابن تيمية", "scholar_id": "SCH-0728", "death_year": 728, "aliases": ["شيخ الإسلام", "ابن تيمية", "تقي الدين"]},
    "الشافعي": {"canonical": "محمد بن إدريس الشافعي", "scholar_id": "SCH-0204", "death_year": 204, "aliases": ["الإمام الشافعي", "ابن إدريس"]},
    "البخاري": {"canonical": "محمد بن إسماعيل البخاري", "scholar_id": "SCH-0256", "death_year": 256, "aliases": ["أمير المؤمنين في الحديث", "الإمام البخاري"]},
    "ابن خلدون": {"canonical": "عبد الرحمن بن خلدون", "scholar_id": "SCH-0808", "death_year": 808, "aliases": ["ابن خلدون", "ولي الدين"]},
}


class IdentityResolverAgent(LinkAgent):
    """حل التباس هويات العلماء والكيانات"""
    
    def __init__(self):
        config = AgentConfig(
            agent_id="LINK-002",
            agent_name="IdentityResolver",
            agent_name_ar="محلل الهوية",
            category=AgentCategory.LINK,
            version="1.0.0",
            daily_budget_usd=1.0,
        )
        super().__init__(config)
    
    async def execute(self, input_data: Dict[str, Any]) -> AgentResult:
        text = input_data.get("text", "")
        mentions = input_data.get("mentions", [])
        
        if not text and not mentions:
            return AgentResult.fail("النص أو قائمة الإشارات مطلوبة")
        
        # استخراج الإشارات من النص إذا لم تُقدم
        if not mentions and text:
            mentions = self._extract_mentions(text)
        
        resolved = []
        for mention in mentions:
            match = self._resolve(mention)
            resolved.append(match)
        
        return AgentResult.ok({
            "resolved_count": len([r for r in resolved if r["resolved"]]),
            "total_mentions": len(mentions),
            "results": resolved,
        })
    
    def _extract_mentions(self, text: str) -> List[str]:
        import re
        patterns = [
            r'(?:الإمام|الشيخ|العلامة)\s+([\u0600-\u06FF]+)',
            r'(?:قال|ذكر)\s+([\u0600-\u06FF]+)',
        ]
        mentions = []
        for p in patterns:
            for m in re.finditer(p, text):
                mentions.append(m.group(1))
        
        # فحص مباشر
        for key in ALIAS_DB:
            if key in text:
                mentions.append(key)
        
        return list(set(mentions))
    
    def _resolve(self, mention: str) -> Dict:
        # بحث مباشر
        if mention in ALIAS_DB:
            data = ALIAS_DB[mention]
            return {
                "mention": mention,
                "resolved": True,
                "canonical_name": data["canonical"],
                "scholar_id": data["scholar_id"],
                "death_year": data["death_year"],
                "confidence": 0.95,
            }
        
        # بحث في الأسماء البديلة
        for key, data in ALIAS_DB.items():
            if mention in data["aliases"]:
                return {
                    "mention": mention,
                    "resolved": True,
                    "canonical_name": data["canonical"],
                    "scholar_id": data["scholar_id"],
                    "death_year": data["death_year"],
                    "confidence": 0.85,
                }
        
        return {"mention": mention, "resolved": False, "confidence": 0.0}


