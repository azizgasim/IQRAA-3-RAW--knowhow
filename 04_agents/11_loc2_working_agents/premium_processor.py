"""
Premium Text Processor - مع Budget Control
معالجة 157M نص بأعلى جودة مع حد ميزانية $10,000
"""

import json
import asyncio
from google.cloud import bigquery
from pathlib import Path
from datetime import datetime

# تحميل العملاء
from claude_client import ClaudeClient

# Budget Tracker
class BudgetTracker:
    """متتبع الميزانية"""
    
    def __init__(self, budget_file: str, limit: float = 10000):
        self.budget_file = Path(budget_file)
        self.limit = limit
        self.load()
    
    def load(self):
        """تحميل من الملف"""
        if self.budget_file.exists():
            with open(self.budget_file) as f:
                self.data = json.load(f)
        else:
            self.data = {
                "budget_limit": self.limit,
                "budget_used": 0,
                "budget_remaining": self.limit,
                "costs": {},
                "texts_processed": 0
            }
    
    def save(self):
        """حفظ للملف"""
        with open(self.budget_file, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def add_cost(self, category: str, amount: float):
        """إضافة تكلفة"""
        self.data["costs"][category] = self.data["costs"].get(category, 0) + amount
        self.data["budget_used"] += amount
        self.data["budget_remaining"] = self.limit - self.data["budget_used"]
        self.save()
        
        # تحقق من الحد
        if self.data["budget_used"] >= self.limit:
            raise Exception(f"🚨 تجاوز الميزانية! المستخدم: ${self.data['budget_used']:.2f}")
        
        # تحذير عند 80%
        if self.data["budget_used"] >= self.limit * 0.8:
            print(f"⚠️ تحذير: استخدمت {self.data['budget_used']/self.limit*100:.0f}% من الميزانية")
    
    def increment_processed(self, count: int = 1):
        """زيادة عداد النصوص"""
        self.data["texts_processed"] += count
        self.save()
    
    def get_status(self):
        """الحالة"""
        return {
            "used": self.data["budget_used"],
            "remaining": self.data["budget_remaining"],
            "percentage": self.data["budget_used"] / self.limit * 100,
            "texts_processed": self.data["texts_processed"]
        }


class PremiumProcessor:
    """معالج متميز مع Budget Control"""
    
    # أسعار النماذج
    PRICES = {
        "claude_opus": {"input": 15/1_000_000, "output": 75/1_000_000},
        "o1_preview": {"input": 15/1_000_000, "output": 60/1_000_000},
        "gpt4o": {"input": 2.5/1_000_000, "output": 10/1_000_000},
        "claude_sonnet": {"input": 3/1_000_000, "output": 15/1_000_000},
        "gemini_pro": {"input": 0.125/1_000_000, "output": 0.375/1_000_000}
    }
    
    def __init__(self, budget_file: str):
        self.budget = BudgetTracker(budget_file)
        self.bq_client = bigquery.Client(project="iqraa-12")
        self.claude = ClaudeClient()
        
        print(f"✅ Premium Processor initialized")
        print(f"   • Budget: ${self.budget.limit:,.0f}")
        print(f"   • Used: ${self.budget.data['budget_used']:.2f}")
        print(f"   • Remaining: ${self.budget.data['budget_remaining']:,.2f}")
    
    async def process_text(self, text: str, chunk_id: str) -> dict:
        """معالجة نص واحد"""
        
        result = {
            "chunk_id": chunk_id,
            "domain": None,
            "subject": None,
            "entities": [],
            "topics": [],
            "quality_score": 0
        }
        
        # 1. التصنيف (Claude Opus)
        prompt = f"""حلل وأعطني JSON:
{{"domain":"...","subject":"...","entities":[...],"topics":[...]}}

النص: {text[:500]}"""
        
        try:
            response = await self.claude.generate(prompt, max_tokens=200)
            
            # حساب التكلفة
            usage = response.get("usage", {})
            cost = (
                usage.get("input_tokens", 50) * self.PRICES["claude_opus"]["input"] +
                usage.get("output_tokens", 100) * self.PRICES["claude_opus"]["output"]
            )
            
            self.budget.add_cost("claude_opus", cost)
            
            # استخراج النتيجة
            text_result = response.get("text", "{}")
            if "```json" in text_result:
                text_result = text_result.split("```json")[1].split("```")[0]
            
            data = json.loads(text_result)
            result.update(data)
            result["quality_score"] = 0.95
            
        except Exception as e:
            print(f"⚠️ خطأ: {e}")
        
        self.budget.increment_processed()
        
        return result
    
    async def process_batch(self, batch_size: int = 100):
        """معالجة دفعة"""
        
        query = f"""
        SELECT chunk_id, record_id, text
        FROM `iqraa-12.diwan_iqraa_v2.pilot_sample_20k`
        LIMIT {batch_size}
        """
        
        rows = list(self.bq_client.query(query).result())
        
        print(f"\n🔄 معالجة {len(rows)} نص...")
        
        results = []
        for row in rows:
            result = await self.process_text(row.text, row.chunk_id)
            results.append(result)
            
            # عرض التقدم كل 10 نصوص
            if len(results) % 10 == 0:
                status = self.budget.get_status()
                print(f"   📊 {len(results)}/{len(rows)} | ${status['used']:.2f} / ${self.budget.limit:,.0f} ({status['percentage']:.1f}%)")
        
        return results


# تشغيل
async def main():
    processor = PremiumProcessor("/home/user/processing_cost_tracker.json")
    
    print("\n🚀 بدء المعالجة...")
    print("═" * 70)
    
    # معالجة 100 نص (تجربة)
    results = await processor.process_batch(100)
    
    print("\n✅ اكتملت الدفعة التجريبية")
    
    # الإحصائيات
    status = processor.budget.get_status()
    
    print(f"\n📊 الإحصائيات:")
    print(f"   • النصوص المُعالجة: {status['texts_processed']}")
    print(f"   • التكلفة المستخدمة: ${status['used']:.2f}")
    print(f"   • المتبقي: ${status['remaining']:,.2f}")
    print(f"   • النسبة: {status['percentage']:.1f}%")
    
    # التقدير للكل
    cost_per_text = status['used'] / status['texts_processed'] if status['texts_processed'] > 0 else 0
    estimated_total = cost_per_text * 157_870_756
    
    print(f"\n📈 التقدير للـ 157M نص:")
    print(f"   • التكلفة/نص: ${cost_per_text:.6f}")
    print(f"   • التكلفة الإجمالية المتوقعة: ${estimated_total:,.0f}")
    
    if estimated_total > processor.budget.limit:
        print(f"\n⚠️ تحذير: التكلفة المتوقعة تتجاوز الميزانية!")
        print(f"   • نحتاج تعديل الخطة")
    else:
        print(f"\n✅ ضمن الميزانية!")

asyncio.run(main())

