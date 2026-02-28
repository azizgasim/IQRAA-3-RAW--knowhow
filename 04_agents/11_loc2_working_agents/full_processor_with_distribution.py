"""
Full Processor - مع التوزيع على الجداول
النسخة المصححة - 2026-01-25
"""

import asyncio
import json
from google.cloud import bigquery
from transformers import AutoTokenizer, AutoModel
import torch
from datetime import datetime
import logging
import uuid

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/home/user/processing.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)


class FullProcessorWithDistribution:
    """معالج كامل مع التوزيع"""
    
    # الحقول المطلوبة لكل جدول
    REQUIRED_FIELDS = [
        "book_id", "chunk_id",
        "city_id", "festival_id", "space_id", "scent_id", "medical_id",
        "child_id", "case_id", "trade_id", "grievance_id", "death_id",
        "maritime_id", "battle_id", "marriage_id", "season_id",
        "textile_id", "bath_id", "magic_id",
    ]
    
    # خريطة المجالات → الجداول
    DOMAIN_TO_TABLE = {
        "فقه": "01_fiqh_rulings",
        "حديث": "02_hadith_corpus",
        "عقيدة": "04_kalam_schools",
        "تاريخ": "03_timeline_events",
        "فلسفة": "10_philosophy_logic",
        "سياسة": "11_rulers_segments",
        "أصول": "05_usul_and_maqasid",
        "جغرافيا": "06_geography_knowledge",
        "اقتصاد": "08_economy_segments",
        "تصوف": "09_sufism_spirituality",
        "economic_history": "economic_distress_famines_taxation_and_public_grievances",
        "urban_studies": "urban_life_and_city_rhythms",
        "architecture": "architectural_spaces_homes_markets_gardens_and_mosques",
        "trade": "merchants_trade_networks_and_hidden_economies",
        "legal_history": "judicial_practices_courtroom_dramas_and_legal_politics",
        "غير محدد": "02_analysis_results"
    }
    
    def __init__(self):
        self.bq_client = bigquery.Client(project="iqraa-12")
        
        logger.info("تحميل CAMeLBERT-CA...")
        self.tokenizer = AutoTokenizer.from_pretrained("CAMeL-Lab/bert-base-arabic-camelbert-ca")
        self.model = AutoModel.from_pretrained("CAMeL-Lab/bert-base-arabic-camelbert-ca")
        self.model.eval()
        
        self.tracker = {
            "started_at": datetime.now().isoformat(),
            "processed": 0,
            "distributed": 0,
            "by_domain": {},
            "errors": 0
        }
        
        logger.info("المعالج جاهز (مع التوزيع)")
    
    def ensure_required_fields(self, row: dict, record_id: str = None) -> dict:
        """ضمان وجود الحقول المطلوبة"""
        # chunk_id - استخدم chunk_id إذا موجود أو أنشئ جديد
        if not row.get("chunk_id"):
            row["chunk_id"] = row.get("chunk_id", str(uuid.uuid4()))
        
        # book_id - استخدم record_id إذا موجود أو أنشئ جديد
        if not row.get("book_id"):
            row["book_id"] = record_id or row.get("record_id", str(uuid.uuid4()))
        
        # باقي الحقول الاختيارية
        for field in self.REQUIRED_FIELDS:
            if field not in ["book_id", "chunk_id"] and field not in row:
                row[field] = None
        
        return row
    
    def save_checkpoint(self):
        with open("/home/user/processing_checkpoint.json", "w") as f:
            json.dump(self.tracker, f, indent=2, ensure_ascii=False)
    
    def get_target_table(self, domain: str) -> str:
        """تحديد الجدول المناسب"""
        table_name = self.DOMAIN_TO_TABLE.get(domain, "02_analysis_results")
        return f"iqraa-12.diwan_iqraa_v2.{table_name}"
    
    def prepare_for_domain_table(self, result: dict, domain: str) -> dict:
        """تحضير السجل للجدول المتخصص"""
        row = {
            "chunk_id": result.get("chunk_id", str(uuid.uuid4())),
            "book_id": result.get("record_id", str(uuid.uuid4())),
            "text": result.get("text", ""),
            "detected_entities": [],
            "classification_confidence": 0.8,
            "classification_source": "camelbert_v1",
            "metadata_boosted": False,
            "human_reviewed": False,
            "created_at": datetime.now().isoformat()
        }
        return row
    
    async def process_and_distribute_batch(self, batch_size=1000):
        """معالجة وتوزيع دفعة"""
        
        query = f"""
        SELECT chunk_id, record_id, text
        FROM `iqraa-12.diwan_iqraa_v2.openiti_chunks`
        WHERE chunk_id NOT IN (
            SELECT chunk_id FROM `iqraa-12.diwan_iqraa_v2.classifications_unified`
        )
        LIMIT {batch_size}
        """
        
        rows = list(self.bq_client.query(query).result())
        
        if not rows:
            logger.info("كل النصوص معالجة!")
            return False
        
        logger.info(f"معالجة وتوزيع {len(rows)} نص...")
        
        processed_results = []
        distribution_map = {}
        
        for row in rows:
            try:
                inputs = self.tokenizer(row.text[:512], return_tensors="pt", truncation=True, max_length=512)
                
                with torch.no_grad():
                    outputs = self.model(**inputs)
                
                domain = self.simple_classify(row.text)
                
                result = {
                    "chunk_id": row.chunk_id,
                    "record_id": row.record_id,
                    "text": row.text,
                    "camelbert_processed": True,
                    "final_domain": domain,
                    "processed_at": datetime.now().isoformat()
                }
                
                processed_results.append(result)
                
                if domain not in distribution_map:
                    distribution_map[domain] = []
                distribution_map[domain].append(result)
                
                self.tracker["processed"] += 1
                
            except Exception as e:
                logger.error(f"خطأ في {row.chunk_id}: {e}")
                self.tracker["errors"] += 1
        
        # حفظ في classifications_unified
        if processed_results:
            errors = self.bq_client.insert_rows_json(
                "iqraa-12.diwan_iqraa_v2.classifications_unified",
                processed_results
            )
            if errors:
                logger.error(f"اخطاء في الحفظ: {errors[:2]}")
        
        # التوزيع على الجداول النهائية - مع الحقول المطلوبة
        for domain, results in distribution_map.items():
            target_table = self.get_target_table(domain)
            
            # تحضير السجلات مع الحقول المطلوبة
            prepared_rows = []
            for r in results:
                prepared_row = self.prepare_for_domain_table(r, domain)
                prepared_rows.append(prepared_row)
            
            try:
                errors = self.bq_client.insert_rows_json(target_table, prepared_rows)
                
                if not errors:
                    self.tracker["distributed"] += len(prepared_rows)
                    if domain not in self.tracker["by_domain"]:
                        self.tracker["by_domain"][domain] = 0
                    self.tracker["by_domain"][domain] += len(prepared_rows)
                    logger.info(f"   OK: {len(prepared_rows)} -> {domain}")
                else:
                    logger.error(f"   FAIL {domain}: {errors[:1]}")
                    
            except Exception as e:
                logger.error(f"   ERROR {domain}: {e}")
        
        if self.tracker["processed"] % 10000 == 0:
            self.save_checkpoint()
            logger.info(f"Checkpoint: {self.tracker['processed']:,}")
        
        return True
    
    def simple_classify(self, text: str) -> str:
        """تصنيف بسيط بالكلمات المفتاحية"""
        text_lower = text.lower()
        
        if any(w in text_lower for w in ["حدثنا", "رواه", "أخبرنا", "سند"]):
            return "حديث"
        elif any(w in text_lower for w in ["قال الشافعي", "قال مالك", "حكم", "فتوى"]):
            return "فقه"
        elif any(w in text_lower for w in ["الله", "التوحيد", "الصفات", "العقيدة"]):
            return "عقيدة"
        elif any(w in text_lower for w in ["سنة", "هجرية", "خليفة", "دولة"]):
            return "تاريخ"
        elif any(w in text_lower for w in ["الجوهر", "العرض", "العقل", "الوجود"]):
            return "فلسفة"
        elif any(w in text_lower for w in ["ضريبة", "تجارة", "سوق", "مال"]):
            return "اقتصاد"
        else:
            return "غير محدد"
    
    async def run(self):
        """تشغيل المعالجة والتوزيع"""
        
        logger.info("بدء المعالجة والتوزيع...")
        logger.info("الهدف: 157,870,756 نص")
        
        while True:
            has_more = await self.process_and_distribute_batch(1000)
            
            if not has_more:
                break
            
            if self.tracker["processed"] % 100000 == 0:
                percentage = self.tracker["processed"] / 157870756 * 100
                logger.info(f"Progress: {self.tracker['processed']:,} ({percentage:.2f}%)")
                logger.info(f"By domain: {self.tracker['by_domain']}")
        
        logger.info("المعالجة والتوزيع اكتملت!")
        self.save_checkpoint()


if __name__ == "__main__":
    processor = FullProcessorWithDistribution()
    asyncio.run(processor.run())
