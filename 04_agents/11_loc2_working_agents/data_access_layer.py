"""
Data Access Layer (DAL) - البوابة الموحدة للبيانات الذهبية
Version: Final Stable
"""
from google.cloud import bigquery
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class DataAccessLayer:
    def __init__(self):
        self.client = bigquery.Client()
        self.project = "iqraa-12"
        self.TABLES = {
            "chunks": f"{self.project}.diwan_iqraa_v2.openiti_chunks",
            "classifications": f"{self.project}.diwan_iqraa_v2.iqraa_golden_classifications",
            "entities": f"{self.project}.diwan_iqraa_v2.entities_master",
            "embeddings": f"{self.project}.diwan_iqraa_v2.embeddings_vectors",
            "knowledge": f"{self.project}.diwan_iqraa_v2.iqraa_knowledge",
            "gov_books": f"{self.project}.iqraa_academic_v2.gov_legacy_books",
            "gov_topics": f"{self.project}.iqraa_academic_v2.gov_topics_taxonomy_ai",
            "gov_balance": f"{self.project}.iqraa_academic_v2.gov_corpus_balance",
        }
        logger.info("✅ DAL Initialized.")

    def search_entities(self, query: str = None, category: str = None, limit: int = 50) -> List[Dict]:
        sql = f"SELECT entity_name, entity_type, COUNT(*) as frequency FROM `{self.TABLES['entities']}` WHERE 1=1"
        params = []
        if query:
            sql += " AND entity_name LIKE @query"
            params.append(bigquery.ScalarQueryParameter("query", "STRING", f"%{query}%"))
        if category:
            sql += " AND entity_type = @category"
            params.append(bigquery.ScalarQueryParameter("category", "STRING", category))
        
        sql += f" GROUP BY entity_name, entity_type ORDER BY frequency DESC LIMIT {limit}"
        
        job_config = bigquery.QueryJobConfig(query_parameters=params)
        return [dict(row) for row in self.client.query(sql, job_config=job_config)]

    def search_golden_content(self, topic: str, limit: int = 10) -> List[Dict]:
        sql = f"""
            SELECT chunk_id, topic_id, confidence, entities
            FROM `{self.TABLES['classifications']}`
            WHERE topic_id LIKE @topic
            ORDER BY confidence DESC
            LIMIT {limit}
        """
        job_config = bigquery.QueryJobConfig(
            query_parameters=[bigquery.ScalarQueryParameter("topic", "STRING", f"%{topic}%")]
        )
        return [dict(row) for row in self.client.query(sql, job_config=job_config)]

    def get_text_content(self, chunk_ids: List[str]) -> Dict[str, str]:
        if not chunk_ids: return {}
        safe_ids = [cid.replace("'", "") for cid in chunk_ids]
        ids_str = ", ".join([f"'{cid}'" for cid in safe_ids])
        query = f"SELECT chunk_id, text FROM `{self.TABLES['chunks']}` WHERE chunk_id IN ({ids_str})"
        results = self.client.query(query).result()
        return {row.chunk_id: row.text for row in results}

    def semantic_search(self, vector: List[float], limit: int = 10) -> List[Dict]:
        if not vector: return []
        vector_str = str(vector)
        query = f"""
            SELECT base.chunk_id, distance
            FROM VECTOR_SEARCH(
                TABLE `{self.TABLES['embeddings']}`, 'embedding',
                (SELECT {vector_str} as embedding),
                top_k => {limit}, options => '{{"fraction_lists_to_search": 0.01}}'
            )
        """
        try:
            rows = self.client.query(query).result()
            return [{"chunk_id": r.chunk_id, "score": 1 - r.distance} for r in rows]
        except Exception as e:
            logger.error(f"Vector Search Error: {e}") 
            return []

    def get_events_by_year(self, year: int, limit: int = 10) -> List[Dict]:
        query = f"""
            SELECT book_id, title_ar, author_id, death_hijri
            FROM `{self.TABLES['gov_books']}`
            WHERE death_hijri = @year
            LIMIT {limit}
        """
        job_config = bigquery.QueryJobConfig(
            query_parameters=[bigquery.ScalarQueryParameter("year", "INTEGER", year)]
        )
        return [dict(row) for row in self.client.query(query, job_config=job_config)]

    def get_content_details(self, chunk_ids: List[str]) -> Dict[str, Dict]:
        if not chunk_ids: return {}
        safe_ids = [cid.replace("'", "") for cid in chunk_ids]
        ids_str = ", ".join([f"'{cid}'" for cid in safe_ids])
        query = f"SELECT chunk_id, text, record_id FROM `{self.TABLES['chunks']}` WHERE chunk_id IN ({ids_str})"
        results = self.client.query(query).result()
        data = {}
        for row in results:
            author = "Unknown"
            book = "Unknown"
            if row.record_id and len(row.record_id) > 4:
                try:
                    parts = row.record_id[4:].split('.')
                    author = parts[0] if len(parts) > 0 else row.record_id
                    book = parts[1] if len(parts) > 1 else ""
                except: pass
            data[row.chunk_id] = {"text": row.text, "author": author, "book": book, "record_id": row.record_id}
        return data


    def save_interaction(self, interaction: dict) -> bool:
        """حفظ نتيجة البحث في جدول المعرفة"""
        import uuid
        from datetime import datetime
        
        row = {
            "interaction_id": str(uuid.uuid4()),
            "source_key": interaction.get("source_key", "search"),
            "agent_id": interaction.get("agent_id", ""),
            "agent_name": interaction.get("agent_name", ""),
            "user_query": interaction.get("query", ""),
            "system_response": str(interaction.get("response", ""))[:5000],
            "response_type": interaction.get("response_type", "analysis"),
            "related_chunk_ids": interaction.get("chunk_ids", []),
            "related_entities": interaction.get("entities", []),
            "tags": interaction.get("tags", []),
            "confidence": interaction.get("confidence", 0.0),
            "is_bookmarked": False,
            "created_at": datetime.utcnow().isoformat(),
            "session_id": interaction.get("session_id", "default")
        }
        
        try:
            table_ref = f"{self.project}.diwan_iqraa_v2.iqraa_knowledge"
            errors = self.client.insert_rows_json(table_ref, [row])
            if not errors:
                logger.info(f"✅ Saved interaction: {row['interaction_id'][:8]}")
                return True
            else:
                logger.error(f"Save failed: {errors}")
                return False
        except Exception as e:
            logger.error(f"Save error: {e}")
            return False

dal = DataAccessLayer()
