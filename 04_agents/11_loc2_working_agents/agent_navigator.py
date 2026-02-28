"""
Agent Navigator - Multi-Entity Support
يدعم الآن عدة كيانات في نفس السؤال
"""

from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum


class FilterType(Enum):
    """أنواع الفلاتر"""
    DOMAIN = "domain"
    CHAPTER = "chapter"
    SCHOOL = "school"
    ENTITY = "entity"
    SCHOLAR = "scholar"


@dataclass
class AtomicFilter:
    """فلتر ذري"""
    type: FilterType
    field: str
    value: str
    confidence: float
    group: Optional[str] = None  # للتجميع (entity_1, entity_2)
    
    def to_sql(self) -> str:
        if self.type == FilterType.ENTITY:
            return f"'{self.value}' IN UNNEST(detected_entities)"
        elif self.type == FilterType.SCHOOL:
            return f"fiqh_school = '{self.value}'"
        elif self.type == FilterType.CHAPTER:
            return f"fiqh_chapter = '{self.value}'"
        else:
            return f"{self.field} = '{self.value}'"


class AgentNavigator:
    """المرشد الذري - مع دعم Multi-Entity"""
    
    SCHOLARS = {
        "الشافعي": {"name": "محمد بن إدريس الشافعي", "school": "الشافعي", "group": "entity_1"},
        "مالك": {"name": "مالك بن أنس", "school": "المالكي", "group": "entity_2"},
        "أبو حنيفة": {"name": "النعمان بن ثابت", "school": "الحنفي", "group": "entity_3"},
        "أحمد": {"name": "أحمد بن حنبل", "school": "الحنبلي", "group": "entity_4"},
    }
    
    CHAPTERS = [
        "الطهارة", "الصلاة", "الزكاة", "الصوم", "الحج",
        "البيوع", "النكاح", "الطلاق", "الحدود", "الجنايات",
        "القضاء", "المواريث", "الوقف", "الوصية"
    ]
    
    SCHOOLS_MAP = {
        "شافعي": "الشافعي", "الشافعية": "الشافعي",
        "مالكي": "المالكي", "المالكية": "المالكي",
        "حنفي": "الحنفي", "الحنفية": "الحنفي",
        "حنبلي": "الحنبلي", "الحنابلة": "الحنبلي",
    }
    
    def __init__(self):
        print("✅ Agent Navigator (Multi-Entity) initialized")
    
    def analyze(self, query: str) -> List[AtomicFilter]:
        """تحليل السؤال - مع دعم عدة كيانات"""
        
        filters = []
        query_lower = query.lower()
        
        print(f"🧭 Agent Navigator يُحلل: {query}")
        
        # 1. كشف العلماء (يدعم عدة علماء الآن!)
        scholars_found = []
        for scholar_key, scholar_info in self.SCHOLARS.items():
            if scholar_key.lower() in query_lower:
                # إضافة كفلتر entity
                filters.append(AtomicFilter(
                    type=FilterType.ENTITY,
                    field="detected_entities",
                    value=scholar_key,
                    confidence=1.0,
                    group=scholar_info["group"]
                ))
                
                scholars_found.append(scholar_key)
                print(f"   ✅ عالم: {scholar_key} (مجموعة: {scholar_info['group']})")
        
        # 2. كشف الأبواب
        for chapter in self.CHAPTERS:
            if chapter in query:
                filters.append(AtomicFilter(
                    type=FilterType.CHAPTER,
                    field="fiqh_chapter",
                    value=chapter,
                    confidence=0.95,
                    group="common"  # مشترك بين كل الكيانات
                ))
                print(f"   ✅ باب: {chapter}")
        
        # 3. كشف المذاهب (فقط إذا لم يُكتشف من العلماء)
        if not any(f.type == FilterType.ENTITY for f in filters):
            for key, value in self.SCHOOLS_MAP.items():
                if key in query_lower:
                    filters.append(AtomicFilter(
                        type=FilterType.SCHOOL,
                        field="fiqh_school",
                        value=value,
                        confidence=0.9,
                        group="school_only"
                    ))
                    print(f"   ✅ مذهب: {value}")
                    break
        
        # 4. كشف الكيانات
        concepts = ["قصر", "جمع", "تقديم", "تأخير", "سفر", "مرض"]
        for concept in concepts:
            if concept in query:
                filters.append(AtomicFilter(
                    type=FilterType.ENTITY,
                    field="detected_entities",
                    value=concept,
                    confidence=0.8,
                    group="common"
                ))
                print(f"   ✅ كيان: {concept}")
        
        # تحديد نوع البحث
        is_comparison = any(word in query_lower for word in ["قارن", "الفرق", "مقارنة", "بين"])
        
        if is_comparison and len(scholars_found) >= 2:
            print(f"   🔍 سؤال مقارنة بين {len(scholars_found)} علماء")
        
        print(f"🗺️ الخريطة الذرية: {len(filters)} فلتر")
        
        return filters

