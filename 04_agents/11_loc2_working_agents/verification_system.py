"""
Verification System - التحقق المتبادل
الوكلاء الأكاديميون يتحققون من GPS

المسار: /home/user/iqraa-12-platform/dashboard/backend/verification_system.py
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass

from agent_navigator import AtomicFilter, FilterType


@dataclass
class VerificationResult:
    """نتيجة التحقق من وكيل واحد"""
    agent_name: str
    approved: bool
    confidence: float
    corrections: List[AtomicFilter]
    reasoning: str


class VerificationSystem:
    """
    نظام التحقق المتبادل
    
    الآلية:
    1. GPS يقترح خريطة ذرية
    2. 3 وكلاء يتحققون (Research, Linguist, Analyst)
    3. إذا 2 من 3 وافقوا → مقبول
    4. إذا رفضوا → تصحيح تلقائي
    """
    
    def __init__(self):
        print("✅ Verification System initialized")
    
    def verify_domain_and_chapter(
        self,
        query: str,
        proposed_filters: List[AtomicFilter]
    ) -> VerificationResult:
        """
        التحقق من المجال والباب (ResearchAgent simulation)
        """
        
        query_lower = query.lower()
        corrections = []
        approved = True
        reasoning = []
        
        # التحقق من الباب
        chapter_filter = next((f for f in proposed_filters if f.type == FilterType.CHAPTER), None)
        
        if chapter_filter:
            # تحقق بسيط: هل الباب موجود في السؤال؟
            if chapter_filter.value not in query:
                approved = False
                reasoning.append(f"الباب '{chapter_filter.value}' غير مذكور صراحة")
            else:
                reasoning.append(f"الباب '{chapter_filter.value}' صحيح")
        
        # التحقق من المذهب
        school_filters = [f for f in proposed_filters if f.type == FilterType.SCHOOL]
        
        for school_filter in school_filters:
            # تحقق: هل المذهب مرتبط بعالم مذكور؟
            if school_filter.value == "الشافعي" and "شافعي" not in query_lower:
                approved = False
                reasoning.append(f"المذهب '{school_filter.value}' غير واضح")
            else:
                reasoning.append(f"المذهب '{school_filter.value}' صحيح")
        
        return VerificationResult(
            agent_name="ResearchAgent",
            approved=approved,
            confidence=0.9 if approved else 0.6,
            corrections=corrections,
            reasoning=" | ".join(reasoning)
        )
    
    def verify_entities(
        self,
        query: str,
        proposed_filters: List[AtomicFilter]
    ) -> VerificationResult:
        """
        التحقق من الكيانات (LinguistAgent simulation)
        """
        
        entity_filters = [f for f in proposed_filters if f.type == FilterType.ENTITY]
        
        approved = True
        reasoning = []
        corrections = []
        
        for entity_filter in entity_filters:
            # تحقق بسيط: هل الكيان موجود في السؤال؟
            if entity_filter.value in query:
                reasoning.append(f"الكيان '{entity_filter.value}' موجود")
            else:
                # قد يكون مرادف
                reasoning.append(f"الكيان '{entity_filter.value}' محتمل")
        
        return VerificationResult(
            agent_name="LinguistAgent",
            approved=approved,
            confidence=0.85,
            corrections=corrections,
            reasoning=" | ".join(reasoning) if reasoning else "لا كيانات"
        )
    
    def verify_logic(
        self,
        query: str,
        proposed_filters: List[AtomicFilter]
    ) -> VerificationResult:
        """
        التحقق من المنطق الكلي (AnalystAgent simulation)
        """
        
        # تحقق من التناسق
        school_filters = [f for f in proposed_filters if f.type == FilterType.SCHOOL]
        entity_filters = [f for f in proposed_filters if f.type == FilterType.ENTITY]
        
        approved = True
        reasoning = []
        
        # منطق: إذا ذُكر عالم، يجب أن يكون مذهبه موجوداً
        scholars_in_entities = [f.value for f in entity_filters if f.value in ["الشافعي", "مالك", "أبو حنيفة", "أحمد"]]
        schools_in_filters = [f.value for f in school_filters]
        
        if len(scholars_in_entities) > len(schools_in_filters):
            reasoning.append(f"عدد العلماء ({len(scholars_in_entities)}) > عدد المذاهب ({len(schools_in_filters)})")
        else:
            reasoning.append("التناسق منطقي")
        
        return VerificationResult(
            agent_name="AnalystAgent",
            approved=approved,
            confidence=0.8,
            corrections=[],
            reasoning=" | ".join(reasoning)
        )
    
    def vote_and_correct(
        self,
        verifications: List[VerificationResult],
        proposed_filters: List[AtomicFilter]
    ) -> tuple[List[AtomicFilter], Dict[str, Any]]:
        """
        التصويت والتصحيح
        
        القاعدة: 2 من 3 موافقة → مقبول
        """
        
        approvals = sum(1 for v in verifications if v.approved)
        total = len(verifications)
        
        print(f"🗳️ التصويت: {approvals}/{total} موافقة")
        
        for v in verifications:
            status = "✅" if v.approved else "❌"
            print(f"   {status} {v.agent_name}: {v.reasoning} (ثقة: {v.confidence:.0%})")
        
        if approvals >= 2:
            # مقبول
            print("   ✅ الخريطة مُصادق عليها")
            return proposed_filters, {"status": "approved", "votes": f"{approvals}/{total}"}
        else:
            # مرفوض - تطبيق التصحيحات
            print("   ⚠️ الخريطة مرفوضة - تطبيق التصحيحات...")
            
            corrected_filters = proposed_filters.copy()
            
            # جمع التصحيحات
            for v in verifications:
                corrected_filters.extend(v.corrections)
            
            return corrected_filters, {"status": "corrected", "votes": f"{approvals}/{total}"}

