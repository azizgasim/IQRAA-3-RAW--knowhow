"""
Orchestrator - مع Parallel Processing
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
sys.path.insert(0, "/home/user/iqraa-12-platform")

from typing import Dict, Any, List
import re
import asyncio
import time

from data_access_layer import DataAccessLayer
from agent_navigator import AgentNavigator
from atomic_query_builder import AtomicQueryBuilder
from verification_system import VerificationSystem
from response_formatter import ResponseFormatter
from simple_cache import SimpleCache
from theorist_agent import TheoristAgent
from genealogy_agent import GenealogyAgent
from observer_agent import ObserverAgent
from observer_agent import ObserverAgent
from ab_testing import ABTester, Variant
from genealogy_agent import GenealogyAgent
from observer_agent import ObserverAgent
from observer_agent import ObserverAgent
from ab_testing import ABTester, Variant


class AgentsOrchestrator:
    """منسق الوكلاء - مع المعالجة المتوازية"""
    
    STOP_WORDS = {
        "في", "من", "على", "إلى", "عن", "هو", "هي", "ما", "لا", "بين", "أو", "هذا", "هذه",
        "التي", "الذي", "الذين", "كان", "كانت", "قد", "ان", "أن", "إن", "لم", "ثم", "حتى",
        "مع", "عند", "بعد", "قبل", "كل", "بعض", "غير", "أي", "له", "لها", "وهو", "وهي",
        "يا", "لو", "إذا", "إذ", "ولا", "بل", "لكن", "وقد", "فقد", "ولم", "حيث",
        # أوامر المستخدم — ليست كلمات بحث!
        "اكتب", "اوصف", "صف", "وصف", "قارن", "مقارنة", "اشرح", "وضح", "بيّن", "اذكر",
        "حلل", "ناقش", "استخرج", "استقصي", "لخص", "مستشهدا", "مستشهداً", "باقتباسات",
        "اقتباسات", "المصادر", "المراجع", "فصّل", "تفصيلا", "تفصيلاً"
    }
    
    def __init__(self, bq_client=None, diwan_tables=None):
        self.data_access = None
        self.navigator = AgentNavigator()
        self.atomic_builder = None
        self.verifier = VerificationSystem()
        self.formatter = ResponseFormatter()
        self.cache = SimpleCache(ttl_minutes=60)
        self.theorist = TheoristAgent()
        self.genealogy = GenealogyAgent(bq_client) if bq_client else None
        self.observer = ObserverAgent()
        self.observer = ObserverAgent()
        self.ab_tester = ABTester()
        self.genealogy = GenealogyAgent(bq_client) if bq_client else None
        self.observer = ObserverAgent()
        self.observer = ObserverAgent()
        self.ab_tester = ABTester()
        self.claude = None
        
        if bq_client:
            self.data_access = DataAccessLayer(bq_client)
            self.atomic_builder = AtomicQueryBuilder(self.data_access)
            print("✅ All components initialized")
        
        try:
            from claude_client import ClaudeClient
            self.claude = ClaudeClient()
        except Exception as e:
            print(f"⚠️ Claude: {e}")
        
        print("✅ Orchestrator (Parallel Processing) جاهز")
    
    def extract_keywords(self, query: str) -> List[str]:
        clean = query.replace("؟", "").replace(".", "").strip()
        words = clean.split()
        
        keywords = []
        for word in words:
            word_clean = re.sub(r'[\u064B-\u065F]', '', word)
            if word_clean not in self.STOP_WORDS and len(word_clean) >= 3:
                keywords.append(word_clean)
        
        return keywords
    
    async def process_query(self, query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        
        start_time = time.time()
        
        results = {
            "query": query,
            "answer": "",
            "findings": [],
            "analysis": {},
            "metadata": {
                "agents_used": [],
                "atomic_filters": [],
                "verification": {},
                "performance": {},
                "processed_by": "parallel_optimized"
            }
        }
        
        try:
            # 0. تحقق من Cache
            if self.cache:
                cached = self.cache.get(query)
                if cached:
                    print("⚡ Cache Hit!")
                    return cached
            
            # 1. استخراج كلمات
            keywords = self.extract_keywords(query)
            print(f"🔍 الكلمات: {keywords}")
            
            # 2. GPS يقترح
            t1 = time.time()
            proposed_filters = self.navigator.analyze(query)
            gps_time = (time.time() - t1) * 1000
            
            results["metadata"]["atomic_filters"] = [
                {"type": f.type.value, "field": f.field, "value": f.value, "confidence": f.confidence, "group": f.group}
                for f in proposed_filters
            ]
            results["metadata"]["agents_used"].append("GPS_Navigator")
            
            # 3. التحقق المتوازي (Parallel!)
            print("🔍 التحقق المتوازي...")
            t2 = time.time()
            
            # تشغيل 3 وكلاء معاً!
            verification_tasks = [
                asyncio.create_task(asyncio.to_thread(
                    self.verifier.verify_domain_and_chapter, query, proposed_filters
                )),
                asyncio.create_task(asyncio.to_thread(
                    self.verifier.verify_entities, query, proposed_filters
                )),
                asyncio.create_task(asyncio.to_thread(
                    self.verifier.verify_logic, query, proposed_filters
                ))
            ]
            
            verifications = await asyncio.gather(*verification_tasks)
            verify_time = (time.time() - t2) * 1000
            
            # 4. التصويت
            verified_filters, vote_result = self.verifier.vote_and_correct(
                verifications,
                proposed_filters
            )
            
            results["metadata"]["verification"] = vote_result
            results["metadata"]["agents_used"].extend([v.agent_name for v in verifications])
            
            # 5. البحث
            t3 = time.time()
            if self.atomic_builder and keywords:
                findings = await self.atomic_builder.search_atomic(
                    keywords=keywords,
                    atomic_filters=verified_filters,
                    limit=100
                )
                
                results["findings"] = findings
                results["metadata"]["agents_used"].append("AtomicSearch")
            
            search_time = (time.time() - t3) * 1000
            
            # 5.5 وكلاء التحليل المتخصصون
            if results.get("findings"):
                try:
                    # Observer — اكتشاف الأنماط
                    if self.observer:
                        patterns = self.observer.observe_patterns(results["findings"])
                        trends = self.observer.detect_trends(results["findings"])
                        results["analysis"]["patterns"] = patterns
                        results["analysis"]["trends"] = trends
                        results["metadata"]["agents_used"].append("ObserverAgent")
                        print(f"🔭 Observer: {len(trends)} اتجاه")

                    # Theorist — استنتاج القواعد
                    if self.theorist:
                        rule = await self.theorist.infer_rule(results["findings"])
                        if rule:
                            results["analysis"]["theory"] = rule
                            results["metadata"]["agents_used"].append("TheoristAgent")
                            print(f"🧠 Theorist: {rule[:80]}")

                    # Genealogy — تتبع التطور
                    if self.genealogy:
                        evolution = await self.genealogy.trace_concept_evolution(query, results["findings"])
                        if evolution:
                            results["analysis"]["evolution"] = evolution
                            results["metadata"]["agents_used"].append("GenealogyAgent")
                            print(f"🌳 Genealogy: traced")
                except Exception as e:
                    print(f"⚠️ Analysis agents error: {str(e)[:100]}")

            # 6. Gemini Analysis
            t4 = time.time()
            claude_answer = ""
            
            if results.get("findings"):
                try:
                    import google.generativeai as genai
                    import os
                    genai.configure(api_key=os.environ.get("GOOGLE_API_KEY", ""))
                    model = genai.GenerativeModel("gemini-2.0-flash")
                    
                    # بناء النصوص مع المصادر
                    # فلتر: فقط مصادر ما قبل 1210هـ
                    import re as _re2
                    pre_filter = []
                    for _f in results["findings"]:
                        _rid = _f.get("metadata", {}).get("record_id", "")
                        _m = _re2.match(r"(\d{4})", _rid)
                        if _m and int(_m.group(1)) <= 1210:
                            pre_filter.append(_f)
                    results["findings"] = pre_filter if pre_filter else results["findings"]
                    print(f"   📜 فلتر 1210هـ: {len(pre_filter)} تراثي من {len(results['findings'])} ")
                    findings_for_gemini = results["findings"][:20]
                    texts_parts = []
                    for i, f in enumerate(findings_for_gemini):
                        excerpt = f.get("excerpt", "")[:800]
                        rid = f.get("metadata", {}).get("record_id", "?")
                        texts_parts.append(f"[{i+1}] ({rid}) {excerpt}")
                    texts = "\n\n".join(texts_parts)
                    
                    prompt = f"""أنت محلل إبستمولوجي متخصص في التراث الإسلامي.

السؤال: {query}

النصوص المصدرية:
{texts}

المطلوب:
1. أجب بتحليل أكاديمي عميق ومنظّم بناءً على النصوص المصدرية فقط
2. **اقتبس مباشرة** من النصوص — ضع الاقتباسات بين «» مع رقم المصدر
3. رتّب إجابتك في محاور واضحة بعناوين فرعية
4. استخدم نظام Harvard للاقتباس: (اسم المؤلف، اسم الكتاب) — مثال: (أحمد أمين، ضحى الإسلام)
   - استخرج اسم المؤلف من record_id (مثال: 1373AhmadAmin = أحمد أمين)
   - استخرج اسم الكتاب من record_id (مثال: DuhaaIslam = ضحى الإسلام)
5. اختم بومضات تحليلية:
   - علاقات السلطة والمعرفة
   - البعد الاقتصادي والاجتماعي
   - التأثيرات الحضارية المتبادلة
   - المقاصد الشرعية إن وُجدت
6. اذكر حدود التحليل وما ينقص المصادر
7. اكتب بالعربية الفصحى بأسلوب أكاديمي"""

                    resp = model.generate_content(prompt)
                    claude_answer = resp.text
                    results["metadata"]["agents_used"].append("GeminiAnalyst")
                    print(f"🤖 Gemini أجاب: {len(claude_answer)} حرف")
                except Exception as e:
                    print(f"⚠️ Gemini error: {str(e)[:100]}")
            
            claude_time = (time.time() - t4) * 1000
            
            # 7. تنسيق الإجابة
            if self.formatter:
                results["answer"] = self.formatter.format_rich_answer(
                    query=query,
                    findings=results["findings"],
                    atomic_filters=results["metadata"]["atomic_filters"],
                    verification=results["metadata"]["verification"],
                    claude_answer=claude_answer
                )
            elif claude_answer:
                results["answer"] = claude_answer
            elif results["findings"]:
                results["answer"] = f"وجدت {len(results['findings'])} نتيجة"
            else:
                results["answer"] = "لم أجد نتائج"
            
            # 8. الأداء
            total_time = (time.time() - start_time) * 1000
            
            results["metadata"]["performance"] = {
                "total_ms": round(total_time, 2),
                "gps_ms": round(gps_time, 2),
                "verification_ms": round(verify_time, 2),
                "search_ms": round(search_time, 2),
                "claude_ms": round(claude_time, 2)
            }
            
            print(f"⏱️ الأداء: {total_time:.0f}ms (GPS: {gps_time:.0f}ms, Verify: {verify_time:.0f}ms, Search: {search_time:.0f}ms, Claude: {claude_time:.0f}ms)")
            
            # 9. حفظ في Cache
            if self.cache:
                self.cache.set(query, results)
            
        except Exception as e:
            print(f"❌ {e}")
            import traceback
            traceback.print_exc()
            results["answer"] = f"خطأ: {e}"
        
        return results

