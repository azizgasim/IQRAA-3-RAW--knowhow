"""
Query Router - Google Cloud Best Practices
يوجه الاستعلامات بذكاء للجداول الصحيحة

Best Practices Applied:
1. Fail Fast: التحقق من الجداول قبل الاستعلام
2. Explicit is Better: أسماء واضحة وصريحة
3. Single Responsibility: كل دالة لها مهمة واحدة
4. Error Handling: معالجة شاملة للأخطاء
"""

from typing import Dict, Any, List
from google.cloud import bigquery
import re

from tables_registry import (
    TABLES_REGISTRY,
    get_active_tables,
    get_table,
    get_tables_for_domain,
    get_default_search_tables
)


class QueryRouter:
    """موجه الاستعلامات - Google Cloud Best Practices"""
    
    def __init__(self, bq_client: bigquery.Client):
        if not bq_client:
            raise ValueError("BigQuery client is required")
        
        self.bq_client = bq_client
        self.active_tables = get_active_tables()
        
        print(f"✅ Query Router initialized")
        print(f"   • Active tables: {len(self.active_tables)}")
        print(f"   • Tables: {[t.key for t in self.active_tables]}")
    
    def detect_domain(self, query: str) -> str:
        """كشف المجال من السؤال"""
        
        query_lower = query.lower()
        
        # خريطة الكلمات المفتاحية للمجالات
        domain_keywords = {
            "فقه": ["فقه", "حكم", "حلال", "حرام", "مذهب", "فتوى", "صلاة", "زكاة", "صوم", "حج"],
            "حديث": ["حديث", "رواية", "سند", "صحيح", "ضعيف", "راوي", "إسناد"],
            "عقيدة": ["عقيدة", "توحيد", "صفات", "أسماء", "إيمان", "كفر"],
            "تاريخ": ["تاريخ", "سيرة", "غزوة", "خليفة", "دولة", "عصر"],
        }
        
        for domain, keywords in domain_keywords.items():
            if any(kw in query_lower for kw in keywords):
                return domain
        
        return "عام"  # افتراضي
    
    async def search(
        self,
        query: str,
        keywords: List[str],
        domain: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        البحث الذكي عبر الجداول المناسبة
        
        Google Cloud Best Practice: Query only what you need
        """
        
        all_results = []
        
        # تحديد المجال
        if not domain:
            domain = self.detect_domain(query)
        
        # تحديد الجداول المناسبة
        if domain == "عام":
            tables_to_search = get_default_search_tables()
        else:
            tables_to_search = get_tables_for_domain(domain)
        
        if not tables_to_search:
            tables_to_search = get_default_search_tables()
        
        print(f"🧭 المجال: {domain}")
        print(f"🧭 سأبحث في {len(tables_to_search)} جدول: {[t.key for t in tables_to_search]}")
        
        # البحث في كل جدول
        for table_def in tables_to_search:
            try:
                results = await self._search_in_table(
                    table_def=table_def,
                    keywords=keywords,
                    limit=limit
                )
                
                all_results.extend(results)
                
                print(f"   ✅ {table_def.name_ar}: {len(results)} نتيجة")
                
                # إذا وجدنا نتائج كافية، توقف (Best Practice: Don't over-query)
                if len(all_results) >= limit:
                    break
                    
            except Exception as e:
                print(f"   ⚠️ {table_def.name_ar}: {e}")
                continue
        
        return all_results[:limit]
    
    async def _search_in_table(
        self,
        table_def: TableDefinition,
        keywords: List[str],
        limit: int
    ) -> List[Dict[str, Any]]:
        """البحث في جدول واحد"""
        
        # بناء الاستعلام (Google Best Practice: Use parameterized queries)
        search_term = " ".join(keywords)
        
        # استعلام موحد يعمل مع جميع الجداول
        sql = f"""
        SELECT 
            {table_def.primary_key} as id,
            book_id,
            {table_def.text_column} as text,
            {', '.join(table_def.metadata_columns) if table_def.metadata_columns else "'{}' as metadata"}
        FROM `{table_def.full_name}`
        WHERE {table_def.text_column} LIKE @search
        LIMIT @limit
        """
        
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("search", "STRING", f"%{search_term}%"),
                bigquery.ScalarQueryParameter("limit", "INT64", limit)
            ]
        )
        
        # تنفيذ الاستعلام
        query_job = self.bq_client.query(sql, job_config=job_config)
        rows = list(query_job.result())
        
        # تنسيق النتائج
        results = []
        for row in rows:
            results.append({
                "id": row.id or "",
                "title": row.book_id or "",
                "excerpt": (row.text or "")[:500],
                "type": table_def.name_ar,
                "source_table": table_def.key,
                "relevanceScore": 0.9,
                "metadata": {
                    "book_id": row.book_id or "",
                    "dataset": table_def.dataset,
                    "table": table_def.table,
                }
            })
        
        return results

