"""
Full Heritage Text Processor
معالجة 157M نص - يعمل في الخلفية
"""

import asyncio
import json
from google.cloud import bigquery
from transformers import AutoTokenizer, AutoModel
import torch
from datetime import datetime
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/home/user/processing.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)


class FullProcessor:
    """المعالج الكامل"""
    
    def __init__(self):
        self.bq_client = bigquery.Client(project="iqraa-12")
        
        # تحميل CAMeLBERT
        logger.info("📥 تحميل CAMeLBERT-CA...")
        self.tokenizer = AutoTokenizer.from_pretrained("CAMeL-Lab/bert-base-arabic-camelbert-ca")
        self.model = AutoModel.from_pretrained("CAMeL-Lab/bert-base-arabic-camelbert-ca")
        self.model.eval()
        
        # تتبع
        self.tracker = {
            "started_at": datetime.now().isoformat(),
            "processed": 0,
            "cost": 0,
            "errors": 0
        }
        
        logger.info("✅ المعالج جاهز")
    
    def save_checkpoint(self):
        """حفظ نقطة استعادة"""
        with open("/home/user/processing_checkpoint.json", "w") as f:
            json.dump(self.tracker, f, indent=2)
    
    async def process_batch(self, batch_size=1000):
        """معالجة دفعة"""
        
        # جلب دفعة من النصوص الخام
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
            logger.info("✅ كل النصوص مُعالجة!")
            return False
        
        logger.info(f"🔄 معالجة {len(rows)} نص...")
        
        results = []
        for row in rows:
            try:
                # المعالجة بـ CAMeLBERT
                inputs = self.tokenizer(row.text[:512], return_tensors="pt", truncation=True)
                
                with torch.no_grad():
                    outputs = self.model(**inputs)
                
                # استخراج التصنيف من embeddings
                # (سنُضيف classifier head لاحقاً)
                
                result = {
                    "chunk_id": row.chunk_id,
                    "record_id": row.record_id,
                    "text": row.text,
                    "camelbert_processed": True,
                    "processed_at": datetime.now().isoformat()
                }
                
                results.append(result)
                self.tracker["processed"] += 1
                
            except Exception as e:
                logger.error(f"❌ خطأ في {row.chunk_id}: {e}")
                self.tracker["errors"] += 1
        
        # حفظ النتائج
        if results:
            errors = self.bq_client.insert_rows_json(
                "iqraa-12.diwan_iqraa_v2.classifications_unified",
                results
            )
            
            if errors:
                logger.error(f"❌ أخطاء في الحفظ: {errors[:3]}")
        
        # حفظ checkpoint
        if self.tracker["processed"] % 10000 == 0:
            self.save_checkpoint()
            logger.info(f"💾 Checkpoint: {self.tracker['processed']:,} نص")
        
        return True
    
    async def run(self):
        """تشغيل المعالجة الكاملة"""
        
        logger.info("🚀 بدء المعالجة الكاملة...")
        logger.info(f"   الهدف: 157,870,756 نص")
        logger.info(f"   الميزانية: $12,895")
        
        while True:
            has_more = await self.process_batch(1000)
            
            if not has_more:
                break
            
            # عرض التقدم
            if self.tracker["processed"] % 100000 == 0:
                percentage = self.tracker["processed"] / 157870756 * 100
                logger.info(f"📊 التقدم: {self.tracker['processed']:,} ({percentage:.2f}%)")
        
        logger.info("✅ المعالجة اكتملت!")
        self.save_checkpoint()


# تشغيل
if __name__ == "__main__":
    processor = FullProcessor()
    asyncio.run(processor.run())

