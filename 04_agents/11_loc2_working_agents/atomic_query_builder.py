"""
Atomic Query Builder - Fixed Multi-Entity
"""

from typing import List, Dict, Any
from google.cloud import bigquery

from agent_navigator import AtomicFilter, FilterType
from data_access_layer import DataAccessLayer


class AtomicQueryBuilder:
    """بناء استعلامات ذرية - مع OR للكيانات المتعددة"""
    
    def __init__(self, data_access: DataAccessLayer):
        self.data_access = data_access
        print("✅ Atomic Query Builder (Multi-Entity OR) initialized")
    
    async def search_atomic(
        self,
        keywords: List[str],
        atomic_filters: List[AtomicFilter],
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """البحث الذري - مع دعم OR"""
        
        # تجميع الفلاتر
        groups = {}
        common_filters = []
        
        for f in atomic_filters:
            if f.group and f.group.startswith("entity_"):
                if f.group not in groups:
                    groups[f.group] = []
                groups[f.group].append(f)
            elif f.group == "common":
                common_filters.append(f)
            else:
                common_filters.append(f)
        
        # إذا كان هناك عدة مجموعات (مقارنة)
        if len(groups) >= 2:
            print(f"🔍 Multi-Entity: {len(groups)} كيانات")
            
            # بحث منفصل لكل كيان
            all_results = []
            
            for group_name, group_filters in groups.items():
                print(f"   📍 بحث: {group_name}")
                
                # استخراج اسم العالم
                scholar_filter = next((f for f in group_filters if f.type == FilterType.ENTITY), None)
                scholar_name = scholar_filter.value if scholar_filter else "unknown"
                
                # الفلاتر المشتركة (الباب فقط، بدون المذهب!)
                chapter_filter = next((f for f in common_filters if f.type == FilterType.CHAPTER), None)
                
                filters_dict = {}
                if chapter_filter and chapter_filter.confidence >= 0.9:
                    filters_dict["fiqh_chapter"] = chapter_filter.value
                
                print(f"      الفلاتر: {filters_dict}")
                
                # البحث
                results = await self.data_access.search_in_table(
                    table_key="fiqh",
                    keywords=[scholar_name],  # ← البحث عن اسم العالم!
                    filters=filters_dict,
                    limit=limit // len(groups)
                )
                
                # إضافة علامة المجموعة
                for r in results:
                    r["metadata"]["entity_group"] = group_name
                    r["metadata"]["scholar"] = scholar_name
                
                print(f"      ✅ {len(results)} نتيجة")
                all_results.extend(results)
            
            print(f"   💎 المجموع: {len(all_results)} نتيجة")
            return all_results[:limit]
        
        # بحث عادي — في الجدول الأم
        else:
            from google.cloud import bigquery as bq
            # استخدام أهم 2-3 كلمات معاً (AND) لنتائج دقيقة
            important = sorted([k for k in keywords if len(k) > 2], key=len, reverse=True)
            if len(important) > 3:
                important = important[:3]
            if not important:
                important = keywords[:1]
            print(f"🔬 بحث AND في openiti_chunks: {important} (من {keywords})")
            try:
                client = self.data_access.client
                
                # AND conditions — النص يجب أن يحتوي كل الكلمات
                conditions = " AND ".join([f"text LIKE @kw{i}" for i in range(len(important))])
                
                sql = f"""
                SELECT chunk_id, record_id, text, token_count
                FROM `diwan_iqraa_v2.openiti_chunks`
                WHERE ({conditions})
                AND token_count BETWEEN 20 AND 500
                AND text NOT LIKE '%PageV%PageV%PageV%'
                AND text NOT LIKE '%(1)%%(2)%%(3)%%(4)%%(5)%'
                AND LENGTH(text) > 80
                AND SAFE_CAST(REGEXP_EXTRACT(record_id, r'^(\d{4})') AS INT64) <= 1210
                ORDER BY token_count DESC
                LIMIT @limit
                """
                params = [
                    bq.ScalarQueryParameter(f"kw{i}", "STRING", f"%{kw}%")
                    for i, kw in enumerate(important)
                ]
                params.append(bq.ScalarQueryParameter("limit", "INT64", limit))
                
                job_config = bq.QueryJobConfig(query_parameters=params)
                query_results = client.query(sql, job_config=job_config).result()
                results = []
                seen_ids = set()
                for row in query_results:
                    d = dict(row)
                    cid = d.get("chunk_id", "")
                    if cid not in seen_ids:
                        seen_ids.add(cid)
                        results.append({"excerpt": d.get("text","")[:1000], "metadata": d})
                print(f"   ✅ {len(results)} نتيجة من openiti_chunks")
                
                # Fallback: if AND returns too few, try single best keyword
                if len(results) < 5 and len(and_words) > 1:
                    print(f"   🔄 Fallback: بحث بكلمة واحدة: {and_words[0]}")
                    fallback_sql = f"""
                    SELECT DISTINCT chunk_id, record_id, text, token_count
                    FROM `diwan_iqraa_v2.openiti_chunks`
                    WHERE text LIKE @fb
                    AND token_count BETWEEN 25 AND 500
                    AND text NOT LIKE '%|||%فهرس%'
                AND text NOT LIKE '%PageV%PageV%PageV%'
                AND text NOT LIKE '%ms%ms%ms%ms%'
                AND text NOT LIKE '%(1)%%(2)%%(3)%%(4)%%(5)%%(6)%%(7)%'
                AND text NOT LIKE '%ENDNOTES%'
                AND text NOT LIKE '%[441]%[442]%[443]%'
                    AND LENGTH(text) > 80
                    ORDER BY token_count DESC
                    LIMIT @limit
                    """
                    fb_config = bq.QueryJobConfig(query_parameters=[
                        bq.ScalarQueryParameter("fb", "STRING", f"%{and_words[0]}%"),
                        bq.ScalarQueryParameter("limit", "INT64", limit),
                    ])
                    for row in client.query(fallback_sql, job_config=fb_config).result():
                        d = dict(row)
                        cid = d.get("chunk_id", "")
                        if cid not in seen_ids:
                            seen_ids.add(cid)
                            results.append({"excerpt": d.get("text","")[:1000], "metadata": d})
                    print(f"   ✅ بعد Fallback: {len(results)} نتيجة")
            except Exception as e:
                print(f"   ❌ Search error: {e}")
                results = []
            
            # النتائج جاهزة
                
            
            return results

