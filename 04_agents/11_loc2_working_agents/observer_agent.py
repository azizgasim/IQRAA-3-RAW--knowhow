"""
Observer Agent - وكيل المراقبة
رصد الأنماط والاتجاهات في البيانات

المسار: /home/user/iqraa-12-platform/dashboard/backend/observer_agent.py
"""

from typing import List, Dict, Any
from collections import Counter


class ObserverAgent:
    """
    وكيل المراقبة
    
    القدرات:
    1. رصد الأنماط في النتائج
    2. تحليل الاتجاهات
    3. إحصائيات متقدمة
    """
    
    def __init__(self):
        print("✅ ObserverAgent initialized")
    
    def observe_patterns(self, findings: List[Dict]) -> Dict[str, Any]:
        """
        رصد الأنماط في النتائج
        
        يُحلل:
        • توزيع المذاهب
        • توزيع الأبواب
        • الكيانات الأكثر تكراراً
        • مستوى الثقة
        """
        
        if not findings:
            return {}
        
        patterns = {
            "total_results": len(findings),
            "schools_distribution": {},
            "chapters_distribution": {},
            "entities_frequency": {},
            "confidence_stats": {
                "min": 1.0,
                "max": 0.0,
                "avg": 0.0
            }
        }
        
        # جمع البيانات
        schools = []
        chapters = []
        all_entities = []
        confidences = []
        
        for f in findings:
            meta = f.get("metadata", {})
            
            if meta.get("fiqh_school"):
                schools.append(meta["fiqh_school"])
            
            if meta.get("fiqh_chapter"):
                chapters.append(meta["fiqh_chapter"])
            
            if meta.get("detected_entities"):
                all_entities.extend(meta["detected_entities"])
            
            if meta.get("classification_confidence"):
                confidences.append(meta["classification_confidence"])
        
        # تحليل
        patterns["schools_distribution"] = dict(Counter(schools))
        patterns["chapters_distribution"] = dict(Counter(chapters))
        patterns["entities_frequency"] = dict(Counter(all_entities).most_common(10))
        
        if confidences:
            patterns["confidence_stats"] = {
                "min": min(confidences),
                "max": max(confidences),
                "avg": sum(confidences) / len(confidences)
            }
        
        return patterns
    
    def detect_trends(self, findings: List[Dict]) -> List[str]:
        """
        كشف الاتجاهات
        
        مثال:
        • "غالبية النتائج من المذهب المالكي"
        • "الباب الأكثر ورداً: الصلاة"
        """
        
        patterns = self.observe_patterns(findings)
        trends = []
        
        # اتجاه المذاهب
        if patterns["schools_distribution"]:
            top_school = max(
                patterns["schools_distribution"].items(),
                key=lambda x: x[1]
            )
            percentage = (top_school[1] / patterns["total_results"]) * 100
            
            if percentage > 50:
                trends.append(f"غالبية النتائج من المذهب {top_school[0]} ({percentage:.0f}%)")
        
        # اتجاه الأبواب
        if patterns["chapters_distribution"]:
            top_chapter = max(
                patterns["chapters_distribution"].items(),
                key=lambda x: x[1]
            )
            trends.append(f"الباب الأكثر ورداً: {top_chapter[0]} ({top_chapter[1]} نتيجة)")
        
        # اتجاه الكيانات
        if patterns["entities_frequency"]:
            top_entity = list(patterns["entities_frequency"].items())[0]
            trends.append(f"الكيان الأكثر تكراراً: {top_entity[0]} ({top_entity[1]} مرة)")
        
        return trends

