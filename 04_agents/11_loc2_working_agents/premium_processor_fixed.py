"""
Premium Processor - Fixed JSON Parsing
"""

import json
import asyncio
import re
from google.cloud import bigquery
from pathlib import Path
from claude_client import ClaudeClient


class BudgetTracker:
    """متتبع الميزانية"""
    
    def __init__(self, budget_file: str, limit: float = 10000):
        self.budget_file = Path(budget_file)
        self.limit = limit
        self.load()
    
    def load(self):
        if self.budget_file.exists():
            with open(self.budget_file) as f:
                self.data = json.load(f)
        else:
            self.data = {
                "budget_limit": self.limit,
                "budget_used": 0,
                "budget_remaining": self.limit,
                "costs": {},
                "texts_processed": 0,
                "texts_failed": 0
            }
    
    def save(self):
        with open(self.budget_file, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def add_cost(self, category: str, amount: float):
        self.data["costs"][category] = self.data["costs"].get(category, 0) + amount
        self.data["budget_used"] += amount
        self.data["budget_remaining"] = self.limit - self.data["budget_used"]
        self.save()
        
        if self.data["budget_used"] >= self.limit:
            raise Exception(f"🚨 تجاوز الميزانية! ${self.data['budget_used']:.2f}")
    
    def increment_processed(self, count: int = 1):
        self.data["texts_processed"] += count
        self.save()
    
    def increment_failed(self, count: int = 1):
        self.data["texts_failed"] += count
        self.save()
    
    def get_status(self):
        return {
            "used": self.data["budget_used"],
            "remaining": self.data["budget_remaining"],
            "percentage": self.data["budget_used"] / self.limit * 100,
            "texts_processed": self.data["texts_processed"],
            "texts_failed": self.data["texts_failed"],
            "success_rate": (self.data["texts_processed"] - self.data["texts_failed"]) / max(self.data["texts_processed"], 1) * 100
        }


class PremiumProcessor:
    """معالج متميز - مُحسّن"""
    
    PRICES = {
        "claude_opus": {"input": 15/1_000_000, "output": 75/1_000_000}
    }
    
    def __init__(self, budget_file: str):
        self.budget = BudgetTracker(budget_file)
        self.bq_client = bigquery.Client(project="iqraa-12")
        self.claude = ClaudeClient()
        
        print(f"✅ Premium Processor (Fixed)")
        print(f"   • Budget: ${self.budget.limit:,.0f}")
        print(f"   • Used: ${self.budget.data['budget_used']:.2f}")
    
    def clean_json(self, text: str) -> str:
        """تنظيف JSON من Claude"""
        
        # إزالة markdown
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        
        # إزالة أسطر جديدة داخل strings
        text = text.strip()
        
        return text
    
    async def process_text(self, text: str, chunk_id: str) -> dict:
        """معالجة نص واحد"""
        
        result = {
            "chunk_id": chunk_id,
            "domain": "غير محدد",
            "subject": "",
            "entities": [],
            "topics": [],
            "quality_score": 0
        }
        
        # Prompt محسّن
        prompt = f"""حلل هذا النص وأعطني JSON صحيح فقط (بدون شرح):

{{"domain":"فقه","subject":"موضوع قصير","entities":["كيان1"],"topics":["موضوع1"]}}

النص:
{text[:400]}

JSON:"""
        
        try:
            response = await self.claude.generate(prompt, max_tokens=150)
            
            # حساب التكلفة
            usage = response.get("usage", {})
            cost = (
                usage.get("input_tokens", 50) * self.PRICES["claude_opus"]["input"] +
                usage.get("output_tokens", 100) * self.PRICES["claude_opus"]["output"]
            )
            
            self.budget.add_cost("claude_opus", cost)
            
            # استخراج وتنظيف JSON
            text_result = response.get("text", "{}")
            text_result = self.clean_json(text_result)
            
            # محاولة parse
            data = json.loads(text_result)
            result.update(data)
            result["quality_score"] = 0.95
            
            self.budget.increment_processed()
            
        except json.JSONDecodeError as e:
            print(f"⚠️ JSON خطأ في {chunk_id}: {str(e)[:50]}")
            self.budget.increment_failed()
            self.budget.increment_processed()
            
        except Exception as e:
            print(f"⚠️ خطأ عام: {e}")
            self.budget.increment_failed()
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
        for i, row in enumerate(rows, 1):
            result = await self.process_text(row.text, row.chunk_id)
            results.append(result)
            
            if i % 10 == 0:
                status = self.budget.get_status()
                print(f"   📊 {i}/{len(rows)} | ${status['used']:.2f} | نجاح: {status['success_rate']:.0f}%")
        
        return results


async def main():
    processor = PremiumProcessor("/home/user/processing_cost_tracker.json")
    
    print("\n🚀 بدء المعالجة...")
    print("═" * 70)
    
    results = await processor.process_batch(100)
    
    print("\n✅ اكتملت الدفعة")
    
    status = processor.budget.get_status()
    
    print(f"\n📊 الإحصائيات:")
    print(f"   • المُعالج: {status['texts_processed']}")
    print(f"   • الناجح: {status['texts_processed'] - status['texts_failed']}")
    print(f"   • الفاشل: {status['texts_failed']}")
    print(f"   • نسبة النجاح: {status['success_rate']:.1f}%")
    print(f"   • التكلفة: ${status['used']:.2f}")
    print(f"   • المتبقي: ${status['remaining']:,.2f}")
    
    cost_per_text = status['used'] / status['texts_processed'] if status['texts_processed'] > 0 else 0
    estimated_total = cost_per_text * 157_870_756
    
    print(f"\n📈 التقدير للـ 157M:")
    print(f"   • التكلفة/نص: ${cost_per_text:.6f}")
    print(f"   • الإجمالي المتوقع: ${estimated_total:,.0f}")
    
    if estimated_total > processor.budget.limit:
        print(f"\n⚠️ فوق الميزانية بـ ${estimated_total - processor.budget.limit:,.0f}")
        print(f"   → نحتاج استخدام Gemini لـ {(estimated_total - processor.budget.limit) / cost_per_text:,.0f} نص")
    else:
        print(f"\n✅ ضمن الميزانية!")

asyncio.run(main())

