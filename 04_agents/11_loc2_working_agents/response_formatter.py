"""
Response Formatter - تنسيق الإجابات
يُحسّن عرض النتائج مع السياق الذري

المسار: /home/user/iqraa-12-platform/dashboard/backend/response_formatter.py
"""

from typing import List, Dict, Any


class ResponseFormatter:
    """منسق الإجابات"""
    
    def __init__(self):
        print("✅ Response Formatter initialized")
    
    def format_rich_answer(
        self,
        query: str,
        findings: List[Dict],
        atomic_filters: List[Dict],
        verification: Dict,
        claude_answer: str = ""
    ) -> str:
        """
        تنسيق إجابة غنية
        
        يتضمن:
        • ملخص الفلاتر المستخدمة
        • إحصائيات النتائج
        • الإجابة من Claude
        • روابط للنتائج
        """
        
        answer_parts = []
        
        # 1. رأس الإجابة
        answer_parts.append(f"📚 **نتائج البحث الذري**\n")
        
        # 2. الفلاتر المستخدمة
        if atomic_filters:
            answer_parts.append(f"\n🔍 **الفلاتر الذرية المُطبّقة:**")
            
            # تجميع حسب النوع
            filters_by_type = {}
            for f in atomic_filters:
                ftype = f.get('type', 'unknown')
                if ftype not in filters_by_type:
                    filters_by_type[ftype] = []
                filters_by_type[ftype].append(f.get('value', ''))
            
            for ftype, values in filters_by_type.items():
                icon = self._get_icon(ftype)
                answer_parts.append(f"   {icon} **{ftype}**: {', '.join(values)}")
        
        # 3. التحقق
        if verification:
            status = verification.get('status', 'unknown')
            votes = verification.get('votes', 'N/A')
            
            if status == 'approved':
                answer_parts.append(f"\n✅ **التحقق**: مُصادق عليه ({votes})")
            elif status == 'corrected':
                answer_parts.append(f"\n⚠️ **التحقق**: تم التصحيح ({votes})")
        
        # 4. الإحصائيات
        if findings:
            num = len(findings)
            
            # تحليل النتائج
            schools = set()
            chapters = set()
            
            for f in findings:
                meta = f.get('metadata', {})
                if meta.get('fiqh_school'):
                    schools.add(meta['fiqh_school'])
                if meta.get('fiqh_chapter'):
                    chapters.add(meta['fiqh_chapter'])
            
            answer_parts.append(f"\n📊 **الإحصائيات:**")
            answer_parts.append(f"   • عدد النتائج: {num}")
            
            if schools:
                answer_parts.append(f"   • المذاهب: {', '.join(schools)}")
            if chapters:
                answer_parts.append(f"   • الأبواب: {', '.join(list(chapters)[:3])}")
        
        # 5. الإجابة من Claude
        if claude_answer:
            answer_parts.append(f"\n💡 **التحليل الأكاديمي:**\n")
            answer_parts.append(claude_answer)
        
        # 6. أبرز النتائج
        if findings:
            answer_parts.append(f"\n📄 **أبرز النتائج:**\n")
            
            for i, f in enumerate(findings[:3], 1):
                meta = f.get('metadata', {})
                
                # السياق
                context_parts = []
                if meta.get('fiqh_school'):
                    context_parts.append(f"المذهب: {meta['fiqh_school']}")
                if meta.get('fiqh_chapter'):
                    context_parts.append(f"الباب: {meta['fiqh_chapter']}")
                
                context = " | ".join(context_parts) if context_parts else "عام"
                
                answer_parts.append(f"\n**{i}. [{context}]**")
                answer_parts.append(f"   {f.get('excerpt', '')[:250]}...")
        
        return "\n".join(answer_parts)
    
    def _get_icon(self, filter_type: str) -> str:
        """أيقونة لكل نوع فلتر"""
        icons = {
            "entity": "👤",
            "scholar": "📚",
            "school": "🏛️",
            "chapter": "📖",
            "domain": "📂"
        }
        return icons.get(filter_type, "•")

