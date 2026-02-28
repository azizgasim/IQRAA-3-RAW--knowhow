"""
Theorist Agent - وكيل النظريات
للاستنباط والاستقراء وبناء القواعد

المسار: /home/user/iqraa-12-platform/dashboard/backend/theorist_agent.py
"""

from typing import List, Dict, Any


class TheoristAgent:
    """
    وكيل النظريات
    
    القدرات:
    1. الاستقراء: من الجزئيات → الكليات
    2. الاستنباط: من الكليات → الجزئيات
    3. بناء القواعد
    """
    
    def __init__(self):
        print("✅ TheoristAgent initialized")
    
    async def infer_rule(self, findings: List[Dict]) -> str:
        """
        الاستقراء: استخراج قاعدة من النتائج
        
        مثال:
        النتائج: 10 فتاوى عن قصر الصلاة
        القاعدة: "المشقة تجلب التيسير"
        """
        
        if not findings:
            return ""
        
        # تحليل بسيط
        entities_count = {}
        
        for f in findings:
            entities = f.get("metadata", {}).get("detected_entities", [])
            for e in entities:
                entities_count[e] = entities_count.get(e, 0) + 1
        
        # أكثر الكيانات تكراراً
        if entities_count:
            top_entity = max(entities_count, key=entities_count.get)
            count = entities_count[top_entity]
            
            rule = f"القاعدة المستنبطة: '{top_entity}' ورد في {count} من {len(findings)} نص"
            return rule
        
        return ""
    
    async def apply_rule(self, rule: str, query: str) -> str:
        """
        الاستنباط: تطبيق قاعدة على حالة جزئية
        
        مثال:
        القاعدة: "المشقة تجلب التيسير"
        السؤال: "هل يجوز الجمع للمريض؟"
        الاستنباط: "نعم، لأن المرض مشقة"
        """
        
        # منطق بسيط
        if "مشقة" in rule.lower() and any(w in query.lower() for w in ["مرض", "سفر", "خوف"]):
            return f"بناءً على القاعدة ({rule}), الجواب: نعم"
        
        return ""

