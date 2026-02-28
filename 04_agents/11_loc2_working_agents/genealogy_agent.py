"""
Genealogy Agent - وكيل الأنساب الفكرية
تتبع تطور المفاهيم والعلماء عبر الزمن

المسار: /home/user/iqraa-12-platform/dashboard/backend/genealogy_agent.py
"""

from typing import List, Dict, Any
from google.cloud import bigquery


class GenealogyAgent:
    """
    وكيل الأنساب الفكرية
    
    القدرات:
    1. تتبع تطور المفاهيم عبر الزمن
    2. بناء شبكة العلماء (من تأثر بمن)
    3. تحليل انتشار الأفكار
    """
    
    def __init__(self, bq_client: bigquery.Client = None):
        self.client = bq_client
        print("✅ GenealogyAgent initialized")
    
    async def trace_concept_evolution(
        self,
        concept: str,
        findings: List[Dict]
    ) -> Dict[str, Any]:
        """
        تتبع تطور مفهوم عبر الزمن
        
        مثال:
        المفهوم: "القياس"
        النتائج: نصوص من قرون مختلفة
        التحليل: كيف تطور المفهوم؟
        """
        
        if not findings:
            return {}
        
        # استخراج التواريخ من book_id
        timeline = {}
        
        for f in findings:
            book_id = f.get("title", "")
            
            # استخراج السنة من book_id (أول 4 أرقام)
            if book_id and len(book_id) >= 4:
                year_str = book_id[:4]
                if year_str.isdigit():
                    year = int(year_str)
                    century = (year // 100) + 1
                    
                    if century not in timeline:
                        timeline[century] = []
                    
                    timeline[century].append({
                        "book": book_id,
                        "excerpt": f.get("excerpt", "")[:100]
                    })
        
        # ترتيب زمني
        sorted_timeline = dict(sorted(timeline.items()))
        
        evolution = {
            "concept": concept,
            "centuries_covered": len(sorted_timeline),
            "timeline": sorted_timeline,
            "summary": f"المفهوم '{concept}' ورد في {len(sorted_timeline)} قرن"
        }
        
        return evolution
    
    async def build_scholar_network(
        self,
        scholar: str,
        findings: List[Dict]
    ) -> Dict[str, Any]:
        """
        بناء شبكة عالم (من ذكره، من تأثر به)
        
        من detected_entities
        """
        
        if not findings:
            return {}
        
        # جمع الكيانات المرتبطة
        related_entities = {}
        
        for f in findings:
            entities = f.get("metadata", {}).get("detected_entities", [])
            
            for entity in entities:
                if entity != scholar:
                    related_entities[entity] = related_entities.get(entity, 0) + 1
        
        # ترتيب حسب التكرار
        sorted_entities = sorted(
            related_entities.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        network = {
            "scholar": scholar,
            "related_scholars": [
                {"name": e, "co_occurrence": c}
                for e, c in sorted_entities[:10]
            ],
            "total_connections": len(related_entities)
        }
        
        return network

