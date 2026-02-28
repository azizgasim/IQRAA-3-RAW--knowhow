"""
Smart Distributor - يُوزّع فقط على الجداول الجاهزة
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
        logging.FileHandler('/home/user/distribution.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)


class SmartDistributor:
    """موزع ذكي - يتجنب الجداول المملوءة"""
    
    # الجداول المملوءة (نتجنبها)
    FILLED_TABLES = [
        "01_fiqh_rulings",
        "02_hadith_corpus",
        "03_timeline_events",
        "04_kalam_schools",
        "05_usul_and_maqasid",
        "06_geography_knowledge",
        "08_economy_segments",
        "09_sufism_spirituality",
        "10_philosophy_logic",
        "11_rulers_segments"
    ]
    
    # خريطة المجالات → الجداول الفارغة
    DOMAIN_TO_EMPTY_TABLE = {
        "اقتصاد": "economic_distress_famines_taxation_and_public_grievances",
        "حضري": "urban_life_and_city_rhythms",
        "عمارة": "architectural_spaces_homes_markets_gardens_and_mosques",
        "تجارة": "merchants_trade_networks_and_hidden_economies",
        "قضاء": "judicial_practices_courtroom_dramas_and_legal_politics",
        "حرب": "warfare_experience_battlefields_and_emotional_histories",
        "بحري": "maritime_life_ports_seafaring_and_pirate_narratives",
        "احتفالات": "festivals_celebrations_and_public_spectacles",
        "طعام": "foodways_culinary_cultures_and_gastronomic_memory",
        "نسيج": "textile_world_weaving_dyes_looms_and_female_economies",
        "موسيقى": "musical_traditions_instruments_singers_and_city_soundscapes",
        "عطور": "perfumery_incense_unguents_and_aromatic_cultures",
        "شرطة": "policing_night_patrols_surveillance_and_moral_order",
        "موت": "death_burial_rituals_grief_cultures_and_afterlife_imaginations",
        "زواج": "marriage_customs_intimacies_conflicts_and_hidden_economies",
        "طفولة": "childhood_worlds_play_learning_and_city_innocence",
        "صحة": "body_health_medicine_healers_and_hidden_remedies",
        "حمامات": "bathhouses_hygiene_beauty_and_gendered_spaces",
        "سحر": "magic_sorcery_omens_divination_and_occult_practices",
        "مواسم": "seasonal_life_rhythms_festivities_migrations_and_city_tempos",
        
        # الافتراضي (للجداول الفارغة)
        "غير محدد": "02_analysis_results"
    }
    
    def __init__(self):
        self.bq_client = bigquery.Client(project="iqraa-12")
        
        logger.info("📥 تحميل CAMeLBERT-CA...")
        self.tokenizer = AutoTokenizer.from_pretrained("CAMeL-Lab/bert-base-arabic-camelbert-ca")
        self.model = AutoModel.from_pretrained("CAMeL-Lab/bert-base-arabic-camelbert-ca")
        self.model.eval()
        
        self.tracker = {
            "started_at": datetime.now().isoformat(),
            "processed": 0,
            "distributed": 0,
            "skipped": 0
        }
        
        logger.info("✅ Smart Distributor جاهز")
    
    def get_target_table(self, domain: str) -> str:
        """تحديد الجدول المناسب (فارغ فقط)"""
        
        # البحث في الخريطة
        table_name = self.DOMAIN_TO_EMPTY_TABLE.get(domain)
        
        if table_name:
            return f"iqraa-12.diwan_iqraa_v2.{table_name}"
        
        # افتراضي
        return "iqraa-12.diwan_iqraa_v2.02_analysis_results"
    
    def simple_classify(self, text: str) -> str:
        """تصنيف بسيط"""
        text_lower = text.lower()
        
        # تصنيف موسع
        if any(w in text_lower for w in ["ضريبة", "مجاعة", "جباية", "خراج"]):
            return "اقتصاد"
        elif any(w in text_lower for w in ["مدينة", "شارع", "سوق", "حي"]):
            return "حضري"
        elif any(w in text_lower for w in ["بناء", "مسجد", "دار", "قصر"]):
            return "عمارة"
        elif any(w in text_lower for w in ["تاجر", "تجارة", "بيع", "شراء"]):
            return "تجارة"
        elif any(w in text_lower for w in ["قاضي", "حكم", "دعوى", "شهادة"]):
            return "قضاء"
        elif any(w in text_lower for w in ["حرب", "غزو", "جهاد", "قتال"]):
            return "حرب"
        elif any(w in text_lower for w in ["بحر", "سفينة", "ميناء"]):
            return "بحري"
        elif any(w in text_lower for w in ["عيد", "احتفال", "مولد"]):
            return "احتفالات"
        elif any(w in text_lower for w in ["طعام", "أكل", "طبخ"]):
            return "طعام"
        elif any(w in text_lower for w in ["ثوب", "نسيج", "حياكة"]):
            return "نسيج"
        elif any(w in text_lower for w in ["موسيقى", "غناء", "آلة"]):
            return "موسيقى"
        elif any(w in text_lower for w in ["عطر", "بخور", "طيب"]):
            return "عطور"
        elif any(w in text_lower for w in ["شرطة", "حراسة", "دورية"]):
            return "شرطة"
        elif any(w in text_lower for w in ["موت", "دفن", "جنازة"]):
            return "موت"
        elif any(w in text_lower for w in ["زواج", "نكاح", "عرس"]):
            return "زواج"
        elif any(w in text_lower for w in ["طفل", "صبي", "لعب"]):
            return "طفولة"
        elif any(w in text_lower for w in ["طب", "دواء", "مرض"]):
            return "صحة"
        elif any(w in text_lower for w in ["حمام", "غسل", "نظافة"]):
            return "حمامات"
        elif any(w in text_lower for w in ["سحر", "شعوذة", "تنجيم"]):
            return "سحر"
        elif any(w in text_lower for w in ["موسم", "فصل", "مناخ"]):
            return "مواسم"
        else:
            return "غير محدد"
    
    async def process_and_distribute_batch(self, batch_size=1000):
        """معالجة وتوزيع ذكي"""
        
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
        
        logger.info(f"�� معالجة وتوزيع {len(rows)} نص...")
        
        processed_results = []
        distribution_map = {}
        
        for row in rows:
            try:
                # معالجة
                inputs = self.tokenizer(row.text[:512], return_tensors="pt", truncation=True, max_length=512)
                
                with torch.no_grad():
                    outputs = self.model(**inputs)
                
                # تصنيف
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
                
                # تجميع للتوزيع (فقط الجداول الفارغة)
                if domain in self.DOMAIN_TO_EMPTY_TABLE:
                    if domain not in distribution_map:
                        distribution_map[domain] = []
                    distribution_map[domain].append(result)
                else:
                    # الجداول المملوءة - نتخطاها
                    self.tracker["skipped"] += 1
                
                self.tracker["processed"] += 1
                
            except Exception as e:
                logger.error(f"❌ خطأ: {e}")
        
        # حفظ في classifications_unified
        if processed_results:
            self.bq_client.insert_rows_json(
                "iqraa-12.diwan_iqraa_v2.classifications_unified",
                processed_results
            )
        
        # التوزيع على الجداول الفارغة فقط
        for domain, results in distribution_map.items():
            target_table = self.get_target_table(domain)
            
            try:
                errors = self.bq_client.insert_rows_json(target_table, results)
                
                if not errors:
                    self.tracker["distributed"] += len(results)
                    logger.info(f"   ✅ وُزّع {len(results)} نص → {domain}")
                else:
                    logger.error(f"   ❌ فشل {domain}: {errors[0]['errors'][0]['message']}")
                    
            except Exception as e:
                logger.error(f"   ❌ خطأ {domain}: {e}")
        
        # تقرير
        if self.tracker["processed"] % 10000 == 0:
            logger.info(f"📊 معالج: {self.tracker['processed']:,} | موزع: {self.tracker['distributed']:,} | متخطى: {self.tracker['skipped']:,}")
        
        return True
    
    async def run(self):
        logger.info("🚀 بدء التوزيع الذكي...")
        logger.info(f"   الهدف: 157,870,756 نص")
        logger.info(f"   التوزيع: على الجداول الفارغة (179) فقط")
        
        while True:
            has_more = await self.process_and_distribute_batch(1000)
            
            if not has_more:
                break
        
        logger.info("✅ اكتمل!")


if __name__ == "__main__":
    distributor = SmartDistributor()
    asyncio.run(distributor.run())

