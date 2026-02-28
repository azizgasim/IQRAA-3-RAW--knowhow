"""
═══════════════════════════════════════════════════════════════════════════
IQRA-12 Entity Extractor Agent (LINK-001)
═══════════════════════════════════════════════════════════════════════════
استخراج الكيانات (أشخاص، كتب، مفاهيم) من النصوص العربية
═══════════════════════════════════════════════════════════════════════════
"""

import re
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

from backend.agents.base.agent import LinkAgent, AgentConfig, AgentResult, AgentCategory


@dataclass
class Entity:
    text: str
    entity_type: str  # PERSON, BOOK, CONCEPT, PLACE, DATE
    start: int
    end: int
    confidence: float


class EntityExtractorAgent(LinkAgent):
    """
    وكيل استخراج الكيانات من النصوص العربية
    """
    
    PERSON_PATTERNS = [
        r'(?:الإمام|الشيخ|العلامة|الحافظ|القاضي|أبو|ابن)\s+[\u0600-\u06FF\s]+',
        r'(?:قال|روى|ذكر|أخبرنا|حدثنا)\s+([\u0600-\u06FF\s]+?)(?:\s*:|\s*رحمه)',
    ]
    
    BOOK_PATTERNS = [
        r'(?:كتاب|صحيح|سنن|مسند|تفسير|إحياء|المستصفى|الرسالة|تهافت|المغني|الأم)\s*[\u0600-\u06FF\s]*',
        r'في\s+([\u0600-\u06FF\s]+?)(?:\s*:|\s*\.)',
    ]
    
    CONCEPT_PATTERNS = [
        r'(?:الإيمان|التوحيد|الفقه|الحديث|التفسير|العقيدة|الأصول|المنطق|الاجتهاد|الإجماع|القياس)',
    ]
    
    def __init__(self):
        config = AgentConfig(
            agent_id="LINK-001",
            agent_name="EntityExtractor",
            agent_name_ar="مستخرج الكيانات",
            category=AgentCategory.LINK,
            version="1.0.0",
            daily_budget_usd=2.0,
            description="اكتشاف الأشخاص والكتب والمفاهيم في النص"
        )
        super().__init__(config)
    
    async def execute(self, input_data: Dict[str, Any]) -> AgentResult:
        text = input_data.get("text", "")
        entity_types = input_data.get("entity_types", ["PERSON", "BOOK", "CONCEPT"])
        
        if not text or len(text) < 10:
            return AgentResult.fail("النص قصير جداً")
        
        entities = []
        
        if "PERSON" in entity_types:
            entities.extend(self._extract_persons(text))
        if "BOOK" in entity_types:
            entities.extend(self._extract_books(text))
        if "CONCEPT" in entity_types:
            entities.extend(self._extract_concepts(text))
        
        # إزالة التكرار
        seen = set()
        unique = []
        for e in entities:
            key = (e["text"].strip(), e["type"])
            if key not in seen:
                seen.add(key)
                unique.append(e)
        
        return AgentResult.ok({
            "text_length": len(text),
            "entity_count": len(unique),
            "entities": unique,
            "summary": {
                "persons": [e["text"] for e in unique if e["type"] == "PERSON"],
                "books": [e["text"] for e in unique if e["type"] == "BOOK"],
                "concepts": [e["text"] for e in unique if e["type"] == "CONCEPT"],
            }
        })
    
    def _extract_persons(self, text: str) -> List[Dict]:
        results = []
        for pattern in self.PERSON_PATTERNS:
            for match in re.finditer(pattern, text):
                results.append({
                    "text": match.group().strip(),
                    "type": "PERSON",
                    "start": match.start(),
                    "end": match.end(),
                    "confidence": 0.8
                })
        return results
    
    def _extract_books(self, text: str) -> List[Dict]:
        results = []
        for pattern in self.BOOK_PATTERNS:
            for match in re.finditer(pattern, text):
                results.append({
                    "text": match.group().strip(),
                    "type": "BOOK",
                    "start": match.start(),
                    "end": match.end(),
                    "confidence": 0.75
                })
        return results
    
    def _extract_concepts(self, text: str) -> List[Dict]:
        results = []
        for pattern in self.CONCEPT_PATTERNS:
            for match in re.finditer(pattern, text):
                results.append({
                    "text": match.group().strip(),
                    "type": "CONCEPT",
                    "start": match.start(),
                    "end": match.end(),
                    "confidence": 0.85
                })
        return results


