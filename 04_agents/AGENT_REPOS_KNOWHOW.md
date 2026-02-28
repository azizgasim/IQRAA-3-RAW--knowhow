# تقرير النوهاو — مخازن الوكلاء الستة
## AGENT_REPOS_KNOWHOW_REPORT
### الجلسة 4 | 2026-02-27

---

## 1. الجرد الكمّي

| # | الريبو | ملفات Python | الحجم | الحالة |
|---|--------|-------------|-------|--------|
| 1 | **iqraa-agents-v2-complete** | 84 | 608K | ⭐ الجيل 5.5: منصة عمليات + وكلاء + بوابات + حوكمة |
| 2 | **agents-course-code** | 66 | 1.4M | ⭐ الجيل 6: بنية تحتية GCP + 44 عملية ذرية + عقود |
| 3 | Iqraa-agents-v2 (zip) | 19 | zip | نسخة مكررة من بوابات + أوركستريتور |
| 4 | iqraa-12-agents (zip) | 37 | zip | الجيل 1.3: وكلاء أوائل (scout, guardian, genealogist) |
| 5 | iqraa-agents-jadal | 0 | فارغ | ❌ |
| 6 | iqraa-agents-v3 | 0 | فارغ | ❌ |

**المجموع الفعلي: 206 ملف Python + 11 YAML + 4 MD + 3 SQL**

---

## 2. الاكتشاف الكبير — الجيل السادس

### agents-course-code = الجيل 6 (الأنضج)

هذا الريبو هو **أنضج** ما أُنتج في مشروع إقرأ-12 ويحتوي:

#### 2.1 البنية التحتية الجاهزة
- `BigQueryClient` — عميل BQ مركزي مع search_passages_text
- `VertexAIClient` — عميل Vertex AI للـ Embeddings + LLM
- `Config` — إعدادات مركزية (project_id=iqraa-12, datasets, tables)
- `structlog` — Structured logging جاهز

#### 2.2 النماذج والعقود (Models + Contracts)
- **Evidence** — الدليل بـ TextSpan (doc_id, char_start, char_end)
- **Claim** — "لا claim بلا evidence"
- **RunContext** — run_id + project_id + user_id + cost_budget_usd
- **OperationInput / OperationOutput** — عقد موحد لكل عملية
- **AutonomyLevel** — L0 (قراءة) → L4 (طيار محدود)
- **RiskTier** — low → critical

#### 2.3 الـ 44 عملية ذرية (8 فئات)
| الفئة | الكود | العدد | القاعدة الذهبية |
|-------|-------|-------|----------------|
| Extract | E1-E6 | 6 | كل مخرج يحمل offset |
| Link | L1-L5 | 5 | كل ربط = Suggest → Evidence → Approve |
| Trace | T1-T5 | 5 | كل تتبع = محطات + انتقالات + تحولات |
| Analyze | A1-A6 | 6 | كل تحليل = بنية + أدلة + حدود + بدائل |
| Construct | C1-C6 | 6 | كل بناء = مواد + منهج + مخرج + provenance |
| Synthesize | S1-S5 | 5 | — |
| Write | W1-W5 | 5 | — |
| Verify | V1-V6 | 6 | — |

#### 2.4 خريطة BigQuery (01_BIGQUERY_MAP.md)
- **6+ datasets** | **224+ جدول**
- `diwan_iqraa_elmi` — 157M+ مقطع نصي (المصدر الرئيسي)
- `dh_acquisition` — مقالات ومجلات
- `iqra_unified` — الطبقة الموحدة (source_registry, passages views)
- `ops` — runs, recipes, agent_registry, decision_log, incidents
- `evidence` — bundles, items, claims, counter_evidence

#### 2.5 SQL Migrations جاهزة
- Migration 001: Create Schema (iqra_unified)
- Migration 002: Materialized Views (passages_diwan, passages_acquisition)
- `source_registry` — 4 مصادر مسجلة

#### 2.6 وثائق الوكلاء (YAML Specs)
- **pkg7**: عائلة التطهير (Purification Family) — كشف تحيزات LLM
- **pkg8**: المستشارون — المرصد (AI Observatory) + Model Router + بروتوكول الشورى
- **pkg9**: الأدوات — وكيل Zotero + المفكرة الذكية (Obsidian)
- **pkg10**: الدعم البحثي — المناهج العلمية + الدعم الأكاديمي + القرين الأكاديمي
- **pkg11**: مدير الوكلاء (Agent Manager) — واجهة اللغة الطبيعية

---

## 3. الاكتشاف المهم — الجيل 5.5

### iqraa-agents-v2-complete = الجيل 5.5

#### 3.1 منظومة الوكلاء (11 وكيل)
1. المنسق (Orchestrator) — توزيع مهام + إدارة تدفق
2. الحارس (Guardian) — حوكمة + 30 مبدأ جدل + كشف مغالطات
3. اللغوي (Linguist) — تحليل صرفي ودلالي
4. الخازن (Archivist) — بحث مصادر + توثيق
5. المحقق (Verifier) — تحقيق إسناد + فحص مصداقية
6. المحلل (Analyst) — استخراج أنماط + استنتاجات
7. الجينيالوجي (Genealogist) — تتبع أصول + تطور تاريخي
8. الرصّاد (Observer) — مراقبة ورصد
9. المنظّر (Theorist) — بناء نظري
10. المطهّر (Purifier) — تنقية وتصفية
11. المحسّن (Improver) — تحسين وإثراء

#### 3.2 البوابات الست (Gates G0-G5)
| البوابة | الوظيفة | العتبة |
|---------|---------|--------|
| G0 Input | فحص مدخلات لغوية | 0.80 |
| G1 Evidence | فحص أدلة ومصادر | 0.70 |
| G2 Concepts | اتساق مفاهيم | 0.75 |
| G3 Genealogy | صحة تتبع تاريخي | 0.70 |
| G4 Theories | تماسك بناء نظري | 0.75 |
| G5 Export | مكافحة هلوسة + J11 "من قال لا أدري فقد أفتى" | — |

#### 3.3 منظومة الحوكمة
- **دستور الجدل**: 165 مبدأ أصلي → 30 مبدأ تشغيلي
- **JadalEvaluator**: تقييم الامتثال
- **JadalEnforcedDeliberation**: ربط الجدل بالتداول
- **FORBIDDEN_FALLACIES**: قائمة المغالطات المحظورة

#### 3.4 بروتوكول التداول (Deliberation Protocol)
- **Messages Schema**: Message, ProposalMessage, DecisionMessage, Conversation
- **DeliberationProtocol + DeliberationState + DeliberationConfig**
- **Gate-Orchestrator Integration**: PipelineResult

#### 3.5 عمليات (Operations) — 10 عمليات مسجلة
| الكود | العملية | الفئة |
|-------|---------|-------|
| A1 | SchemaAnalysis | analyze |
| A2 | ContextMapping | analyze |
| C1 | QueryBuilder | construct |
| C2 | PipelineSetup | construct |
| E1 | TextSearch | extract |
| L1 | ReferenceLinker | link |
| S1 | ResponseComposer | synthesize |
| T1 | LineageTracker | trace |
| V1 | CitationAudit | verify |
| W1 | OutputGenerator | write |

---

## 4. الجيل 1.3 (iqraa-12-agents)

بنية وكلاء مبكرة:
- **core**: orchestrator, guardian
- **exploration**: scout, genealogist
- **building**: purifier, theorist
- **memory**: rag_pipeline
- **meta**: improver
- **observability**: —
- **adapters/google_cloud**: bigquery_schemas

---

## 5. تحديث شجرة الأجيال (7 أجيال الآن)

| الجيل | المصدر | الوصف |
|-------|--------|-------|
| Gen1 | backend/agents/ | وكلاء استعلام بسيطة |
| Gen1.3 | **iqraa-12-agents** (zip) | وكلاء أوائل (scout, guardian, genealogist) |
| Gen2 | agents/ (بوابة + جدل) | نظام Gateway + dialectic |
| Gen3 | archive/sleeping/ | وكلاء نائمة |
| Gen4 | gen4 clean platform | منصة نظيفة 25K سطر |
| Gen5 | مواصفات + عقود + باسم | 80 وكيل مصمم + 12 مفصل |
| Gen5.5 | **iqraa-agents-v2-complete** | 11 وكيل + 6 بوابات + حوكمة جدل + 10 عمليات |
| Gen6 | **agents-course-code** | ⭐ الأنضج: BQ+Vertex+44 عملية+عقود+SQL+YAML |

---

## 6. الدروس الذهبية الجديدة (تحديث)

### من الجيل 6 (agents-course-code):
11. **44 عملية ذرية** بعقود YAML مفصلة (inputs/outputs/golden_rule)
12. **TextSpan = الحقيقة** — كل evidence يحمل (doc_id, char_start, char_end)
13. **AutonomyLevel L0→L4** — تدرج صلاحيات الوكلاء
14. **RunContext** — لا تشغيل بدون run_id + cost_budget_usd
15. **BigQuery Map** — 6 datasets, 224+ جدول, 157M+ مقطع
16. **SQL Migrations** — iqra_unified schema جاهز للنشر
17. **بروتوكول الشورى** — Multi-Model Consultation للقرارات الحساسة
18. **Model Router** — "لا نستخدم مدفعاً لقتل ذبابة"
19. **عائلة التطهير** — كشف تحيزات LLM (بريئة/مصممة/ثقافية/قيمية)
20. **المبدأ المركزي**: "الوكيل ليس كياناً ثابتاً، بل تركيبة ديناميكية تتشكل من السؤال"

### من الجيل 5.5 (v2-complete):
21. **دستور الجدل** — 165 → 30 مبدأ تشغيلي من 6 مصادر تراثية
22. **JadalEnforcedDeliberation** — فحص كل رسالة قبل إرسالها
23. **FORBIDDEN_FALLACIES** — قائمة مغالطات محظورة مبرمجة
24. **Gate Pipeline** — G0→G5 بتكامل مع الأوركستريتور
25. **OperationsRegistry** — سجل مركزي (register/get/list/filter by category)

---

## 7. التوصيات المعمارية لـ Agents-v2

بناءً على 7 أجيال من النوهاو:

### يجب اعتماده فوراً:
1. **BaseOperation + 44 عقد** من الجيل 6 (الأنضج والأكمل)
2. **Evidence + TextSpan + Claim** من schemas الجيل 6
3. **RunContext + AutonomyLevel + RiskTier** من enums الجيل 6
4. **6 Gates (G0-G5)** من الجيل 5.5
5. **JadalConstitution + JadalEnforcedDeliberation** من الجيل 5.5
6. **BigQuery schema + SQL Migrations** من الجيل 6
7. **BigQueryClient + VertexAIClient** من الجيل 6

### يجب تصميمه من جديد:
1. **Message Bus** — غير موجود في أي جيل (كل الأجيال تستخدم استدعاء مباشر)
2. **Orchestrator** — يوجد 4 نسخ مختلفة، نحتاج واحد موحد
3. **Agent ↔ Operation mapping** — الجيل 6 يفصلهما والجيل 5.5 يدمجهما

### يمكن تأجيله:
1. وكلاء pkg7-pkg11 (التطهير، المستشارون، الأدوات) — Phase 4+
2. بروتوكول الشورى — Phase 3+
3. Model Router — Phase 2+

---

## 8. ملاحظة على التكرار

الريبوهات 3 و 4 و 5 و 6 هي نسخ مكررة أو فارغة:
- **Iqraa-agents-v2 (zip)** = نسخة من بوابات الجيل 5.5 (مكررة)
- **iqraa-12-agents (zip)** = الجيل 1.3 (قيمة تاريخية فقط)
- **iqraa-agents-jadal** = فارغ
- **iqraa-agents-v3** = فارغ

**المصادر المعتمدة للبناء: الجيل 6 (agents-course-code) + الجيل 5.5 (v2-complete) + الجيل 4 (clean platform)**
