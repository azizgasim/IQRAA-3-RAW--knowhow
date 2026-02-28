# تقرير استخلاص النوهاو الشامل — منظومة وكلاء إقرأ-12
**التاريخ**: 2026-02-27 | **المُعِد**: المعماري الرئيسي | **الإصدار**: 1.0

---

## القسم الأول: مصادر النوهاو المفحوصة

### 1.1 عروض كتب من كيمي (2,725 سطر)
ملف مرجعي ذهبي يتضمن مراجعات معمقة لـ **20 مرجع أكاديمي + استشاري** مع دروس مستخلصة لإقرأ. يغطي:
- 10 مراجع أكاديمية محكمة (وكلاء ذكيين، معمارية، تعلم، تقييم)
- 10 تقارير استشارية (Deloitte, McKinsey, Google, ChatGPT)
- 8+ دراسات حالة عالمية لوكلاء أكاديميين

### 1.2 Master Prompt (iqra12_master_prompt.md)
دستور تشغيلي شامل يحدد **7 وكلاء أكاديميين** بمواصفات تفصيلية:
1. وكيل الاستكشاف المعرفي
2. وكيل المناهج والمقررات
3. وكيل التنبيه الأكاديمي
4. وكيل إيقاد الشرارات العبقرية
5. وكيل الاقتناء والتوريد
6. وكيل الكتابة الأكاديمية
7. وكيل التنمية والسياسات

### 1.3 المنصة النظيفة gen4 (415 ملف Python)
منظومة أكواد مكتملة الهيكل تشمل:
- 4 وكلاء (research, analysis, writing, reviewer) — Stubs
- 6 بوابات حوكمة مكتملة (Gate 0-5)
- Orchestrator كامل مع lifecycle 7 مراحل
- CreativeELiteMachine — آلة حالات إبداعية 5 مراحل
- نظام ميزانية + تدقيق + سياسات + أمان

### 1.4 سجل 80 وكيل (AGENT_REGISTRY_IQRA12.md)
خارطة طريق شاملة: 80 وكيل مُصمَّم، 3 منفذة، 74 متبقية. يحدد:
- 5 عمليات: SEARCH → LINK → INFER → SYNTHESIZE → BUILD
- 5 مستويات استقلالية (L0-L4)
- 4 طبقات: حوكمة، تنسيق، عمليات، دعم

### 1.5 مواصفات 12 وكيل (AGENTS_SPECS.md)
عقود مُهيكلة لـ 12 وكيل ناقص مع TypeScript interfaces

### 1.6 عقود العمليات (8 YAML)
عقود العمليات الدقيقة: Extract, Link, Trace, Analyze, Construct, Synthesize, Write, Verify

### 1.7 تقارير استشارية ومشاورات (20+ docx)
تقارير من McKinsey, Deloitte, BCG, Bain, Accenture, EY, Capgemini, Google, OpenAI

### 1.8 Turath Project (مشروع التراث)
نموذج embeddings + تصنيف + data dictionary

---

## القسم الثاني: الدروس المستخلصة الذهبية

### 2.1 دروس المعمارية (من المراجع الأكاديمية + gen4)

| # | الدرس | المصدر |
|---|-------|--------|
| 1 | **المعمارية الهجينة (Hybrid)** أفضل توازن بين سرعة الاستجابة وعمق التخطيط | Weiß et al. 2023 |
| 2 | **Planner-Tool-Verifier** هي المعمارية المثلى للوكيل الأكاديمي | Google LangAgent |
| 3 | **6 بوابات حوكمة** مكتملة وجاهزة للاستخدام من gen4 | المنصة النظيفة |
| 4 | **ExecutionContext** كنموذج سياق موحد — أفضل من تمرير المعاملات | gen4 orchestrator |
| 5 | **دورة حياة 7 مراحل** INIT→PLAN→GOVERN→EXECUTE→REVIEW→FINALIZE→FAILED | gen4 lifecycle |
| 6 | **نظام قرارات رباعي** ALLOW/DENY/DEFER/SOFT_DENY مع evidence | gen4 decision |
| 7 | **Side-Car Container** يُتيح إضافة وكيل دون إيقاف المنظومة | McKinsey 2024 |
| 8 | **Orchestration Layer** يُقلل تعقيد التكامل من n×n إلى n×1 | McKinsey Canvas |
| 9 | **Policy-As-Code (OPA/Rego)** يُسرّع الموافقة من 5 أيام إلى 3 ساعات | McKinsey 2024 |
| 10 | **Event-Sourcing** ضروري لتتبع كل قرار وتمكين Rollback | Deloitte + McKinsey |

### 2.2 دروس التشغيل (من التقارير الاستشارية)

| # | الدرس | المصدر |
|---|-------|--------|
| 1 | ابدأ بـ **MVP ضيق** ثم وسّع تدريجياً | كل المصادر |
| 2 | **Health-Agent** يراقب كل وكيل ويُرسل Metrics كل دقيقة | Deloitte 2024 |
| 3 | **Kill-Switch** لكل وكيل — إيقاف طارئ خلال 5 ثوان | Deloitte + McKinsey |
| 4 | **Rollback** خلال 60 ثانية عبر GitOps + Argo CD | McKinsey + MFRPA |
| 5 | **Rate-Limiting** لحماية الخادم من الطلبات الزائدة | Google LangAgent |
| 6 | **Load-Test** حتى 150% من الاستخدام المتوقع قبل الإنتاج | Deloitte 2024 |
| 7 | **Audit-Trail JSON** لكل خطوة — يُرسل إلى Data-Lake يومياً | Deloitte + gen4 |
| 8 | **Dashboard موحد** يجمع كل الوكلاء في لوحة واحدة | Deloitte 2024 |
| 9 | **وكيل نسخ احتياطي** يُخرج ملفات JSON قبل التحديثات | Deloitte 2024 |
| 10 | **TTL (Time-To-Live)** لكل مهمة لتجنب الانتظار غير المحدود | Deloitte 2024 |

### 2.3 دروس الوكلاء الأكاديميين (من المراجع + Master Prompt)

| # | الدرس | المصدر |
|---|-------|--------|
| 1 | **وكيل Verifier مستقل** قبل إرسال أي نتيجة للمستخدم | LangAgent + gen4 |
| 2 | **Citation-Fetch** لإرفاق مصدر بكل جملة تُنتج | LangAgent |
| 3 | **Faithfulness-Score** يُظهر ثقة الوكيل في إجابته | LangAgent |
| 4 | **Explainability-Score** يرفع تقييم الأكاديميين من 3.1 إلى 4.4/5 | McKinsey |
| 5 | **Arabic-NLP (CAMeL + Farasa)** يحقق F1=0.92 على الاستخراج العربي | MFRPA دراسة حالة |
| 6 | **Code-Switch عربي-إنجليزي** ضروري للوكلاء الأكاديميين | كل المصادر |
| 7 | **MaxTools=7** حد أقصى لعدد الأدوات لتجنب الحلقات المفرغة | LangAgent |
| 8 | **Intent-Log** مع كل قرار لتمكين التفسير | Weiß et al. |
| 9 | **DOI لكل وكيل** لتسهيل الاقتباس الأكاديمي | كل المصادر |
| 10 | **Chat-GUI** يُقلل الحاجة لدورات تدريب طويلة | Weiß et al. |

### 2.4 دروس المخاطر والأخطاء الشائعة

| # | الخطأ | العاقبة |
|---|-------|---------|
| 1 | الاستغناء الكامل عن التدخل البشري | قرارات غير قابلة للإلغاء |
| 2 | إغفال طبقة التفسير | فقدان ثقة الأكاديميين |
| 3 | تعلم مستمر بلا حدود زمنية | ارتفاع كلفة 300% |
| 4 | إهمال تحديث الأنطولوجيا | انحراف القرارات |
| 5 | تخزين بلا تشفير | تعرض بيانات للخطر |
| 6 | KPI تقنية فقط | إخفاء تراجع الرضا |
| 7 | صلاحيات حذف نهائية للوكيل | فقدان بيانات محاسبية |
| 8 | إطلاق بلا Load-Test | انهيار بداية الفصل |
| 9 | غياب Kill-Switch | مخاطر أمنية |
| 10 | وكيل واحد = SPOF | نقطة فشل واحدة |

---

## القسم الثالث: ما يُتبنّى مباشرة في Agents-v2

### 3.1 من gen4 (كود جاهز)
- ✅ ExecutionContext — نموذج السياق الموحد
- ✅ Decision + DecisionStatus — نظام القرارات الرباعي
- ✅ LifecyclePhase — 7 مراحل
- ✅ GateBase + 6 بوابات — نظام الحوكمة الكامل
- ✅ PolicyEngine — محرك السياسات الحتمي
- ✅ AuditEngine — محرك التدقيق المُهيكل
- ✅ BudgetEngine — نظام الميزانية (tokens, tool_calls, wall_ms, usd)
- ✅ CostGuardian — حارس التكلفة مع preflight
- ✅ Orchestrator.run() — حلقة التنسيق الكاملة
- ✅ Exceptions — 4 أنواع (Gate, Budget, Policy, Safety)
- ✅ CreativeELiteMachine — المسار الإبداعي

### 3.2 من Master Prompt (تصميم الوكلاء)
- ✅ 7 وكلاء أكاديميين بمواصفات تفصيلية
- ✅ هيكل التقرير الاستشاري (4 أجزاء)
- ✅ الهوية المهنية الثلاثية (أكاديمي + استراتيجي + هندسي)

### 3.3 من النوهاو (أنماط التصميم)
- ✅ Planner-Tool-Verifier pattern
- ✅ Citation-Fetch + Faithfulness-Score
- ✅ Event-Sourcing + Audit-Trail
- ✅ Side-Car deployment pattern
- ✅ Kill-Switch + Rollback < 60s
- ✅ Health-Agent monitoring
- ✅ Arabic-NLP (CAMeL + Farasa) integration

### 3.4 ما يُبنى من الصفر
- ❌ اتصال فعلي بـ LLM (Claude/Gemini) — الوكلاء حالياً Stubs
- ❌ Message Bus بين الوكلاء
- ❌ اتصال فعلي بـ BigQuery
- ❌ Vector Search integration
- ❌ Dashboard فعلي

---

## القسم الرابع: التصميم المقترح لمنظومة Agents-v2

### 4.1 المبادئ المعمارية
1. **Hybrid Architecture** = BDI + Reactive + LLM-backed
2. **Planner-Tool-Verifier** لكل وكيل
3. **6 بوابات حوكمة** (Gate 0-5) من gen4
4. **ExecutionContext** كعمود فقري موحد
5. **Event-Sourcing** لكل قرار
6. **Side-Car** للتوسع بلا توقف

### 4.2 الوكلاء الستة الأساسية (Agents-v2 MVP)

| الوكيل | الدور | يرث من gen4 | يرث من Master Prompt |
|--------|-------|-------------|---------------------|
| **الورّاق** (al-Warraq) | بحث وجمع الأدلة | research_agent + QueryExpander | وكيل الاستكشاف المعرفي |
| **المصنِّف** (al-Musannif) | تصنيف وفهرسة | — (جديد) | وكيل المناهج + الاقتناء |
| **الموجِّه** (al-Muwajjih) | ربط واقتراح | RelationProposer + Suggester | وكيل إيقاد الشرارات |
| **المحلِّلون** (al-Muhallilun) | تحليل وتقييم | analysis_agent + ClaimValidator | — |
| **المراجع** (al-Muraji) | مراجعة جودة | reviewer_agent + QualityChecker | — |
| **المنسِّق** (al-Munassiq) | تنسيق وتنظيم | orchestrator | — |

### 4.3 طبقة الحوكمة (جاهزة من gen4)
- Gate 0: هوية الوكيل وحدوده
- Gate 1: تنظيم متعدد الوكلاء (لا مراجعة ذاتية)
- Gate 2: القيم والحوافز (intent + alternatives)
- Gate 3: الأمان والإيقاف الطارئ
- Gate 4: الجودة والتقييم (soft gate)
- Gate 5: الميزانية والتكلفة

### 4.4 البنية التحتية المطلوبة
- Message Bus: Pub/Sub أو Redis Streams
- Storage: BigQuery (lineage_events, audit_trail)
- Vector: Vertex AI Vector Search
- Monitoring: Health-Agent + Dashboard
- Security: Kill-Switch + TLS 1.3 + CMEK

---

## القسم الخامس: خارطة طريق التنفيذ

### Phase 0: Foundation (أسبوع 1-2)
- [ ] نقل gen4 gates + context + lifecycle إلى v2
- [ ] بناء Message Bus أساسي
- [ ] إنشاء schema BigQuery (lineage_events)

### Phase 1: الورّاق MVP (أسبوع 3-4)
- [ ] ربط الورّاق بـ Gemini/Claude
- [ ] Citation-Fetch + Faithfulness-Score
- [ ] اختبار e2e

### Phase 2: المحلّلون + المراجع (أسبوع 5-6)
- [ ] تحليل الأدلة
- [ ] مراجعة مستقلة (Gate 1 enforced)
- [ ] Verifier step

### Phase 3: المنسّق + Dashboard (أسبوع 7-8)
- [ ] Orchestration Layer
- [ ] Health-Agent
- [ ] Dashboard موحد

### Phase 4: المصنّف + الموجّه (أسبوع 9-10)
- [ ] تصنيف وفهرسة
- [ ] ربط وعلاقات
- [ ] Arabic-NLP integration

### Phase 5: Hardening (أسبوع 11-12)
- [ ] Kill-Switch + Rollback < 60s
- [ ] Load-Test 150%
- [ ] Security audit
- [ ] DOI assignment
