"""
Fine-tuning Exporter
تصدير الأخطاء المُصححة لتحسين GPS

المسار: /home/user/iqraa-12-platform/dashboard/backend/finetuning_exporter.py
"""

from google.cloud import bigquery
import json
from pathlib import Path


class FinetuningExporter:
    """مُصدّر بيانات الـ Fine-tuning"""
    
    def __init__(self, bq_client: bigquery.Client):
        self.client = bq_client
        self.errors_table = "iqraa-12.diwan_iqraa_v2.agent_errors_log"
        print("✅ Fine-tuning Exporter initialized")
    
    async def export_training_data(
        self,
        output_file: str = "/home/user/gps_finetuning_data.jsonl",
        min_corrections: int = 10
    ) -> int:
        """
        تصدير بيانات التدريب
        
        Format: JSONL for Claude fine-tuning
        """
        
        # جلب الأخطاء المُصححة
        sql = f"""
        SELECT 
            query,
            proposed_filters,
            correction
        FROM `{self.errors_table}`
        WHERE correction IS NOT NULL
        LIMIT 1000
        """
        
        try:
            rows = list(self.client.query(sql).result())
            
            if len(rows) < min_corrections:
                print(f"⚠️ عدد الأخطاء المُصححة قليل: {len(rows)} (الحد الأدنى: {min_corrections})")
                return 0
            
            training_examples = []
            
            for row in rows:
                # الخريطة الخاطئة
                wrong = json.loads(row.proposed_filters) if row.proposed_filters else []
                
                # الخريطة الصحيحة
                correct = json.loads(row.correction) if row.correction else []
                
                # إنشاء مثال تدريبي
                example = {
                    "messages": [
                        {
                            "role": "system",
                            "content": "أنت Agent Navigator. تُحلل الأسئلة الأكاديمية وتُصدر خريطة ذرية من الفلاتر."
                        },
                        {
                            "role": "user",
                            "content": f"حلل هذا السؤال وأصدر الخريطة الذرية:\n{row.query}"
                        },
                        {
                            "role": "assistant",
                            "content": json.dumps(correct, ensure_ascii=False)
                        }
                    ]
                }
                
                training_examples.append(example)
            
            # حفظ
            output_path = Path(output_file)
            with open(output_path, 'w', encoding='utf-8') as f:
                for example in training_examples:
                    f.write(json.dumps(example, ensure_ascii=False) + '\n')
            
            print(f"✅ تم تصدير {len(training_examples)} مثال")
            print(f"📄 الملف: {output_file}")
            
            return len(training_examples)
            
        except Exception as e:
            print(f"❌ خطأ: {e}")
            return 0

