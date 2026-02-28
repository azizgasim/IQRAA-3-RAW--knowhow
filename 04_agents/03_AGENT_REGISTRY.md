# 📋 سجل وكلاء إقرأ-12 الشامل
## IQRA-12 Agent Registry v1.0

---

**تاريخ الإنشاء:** 21 ديسمبر 2025  
**الحالة:** مسودة للمراجعة  
**المالك:** فريق معمارية الوكلاء  

---

## 📊 ملخص تنفيذي

| المؤشر | القيمة |
|--------|--------|
| إجمالي الوكلاء | 80 |
| الوكلاء المنفذة | 3 (4%) |
| الوكلاء الجزئية | 3 (4%) |
| الوكلاء المتبقية | 74 (92%) |
| العمليات الأساسية | 5 |
| الأولوية القصوى | 6 وكلاء |

---

## 🏗️ البنية العامة للمنظومة

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                        منظومة وكلاء إقرأ-12                                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ┌─────────────────────────────────────────────────────────────────────┐    ║
║  │                    طبقة الحوكمة (Governance Layer)                  │    ║
║  │  Cost Guardian │ Publish Gate │ Audit │ Rights │ Decision Log       │    ║
║  └─────────────────────────────────────────────────────────────────────┘    ║
║                                    │                                         ║
║  ┌─────────────────────────────────────────────────────────────────────┐    ║
║  │                    طبقة التنسيق (Orchestration Layer)               │    ║
║  │  Unified Pipeline │ Task Router │ Context Manager │ Memory Stream   │    ║
║  └─────────────────────────────────────────────────────────────────────┘    ║
║                                    │                                         ║
║  ╔═════════════════════════════════════════════════════════════════════╗    ║
║  ║              العمليات الخمس الأساسية (Core Operations)              ║    ║
║  ╠═════════════════════════════════════════════════════════════════════╣    ║
║  ║                                                                      ║    ║
║  ║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  ║    ║
║  ║  │  SEARCH  │→│   LINK   │→│  INFER   │→│SYNTHESIZE│→│  BUILD   │  ║    ║
║  ║  │ 8 وكلاء  │ │ 12 وكيل  │ │ 15 وكيل  │ │ 10 وكلاء │ │ 8 وكلاء  │  ║    ║
║  ║  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  ║    ║
║  ║                                                                      ║    ║
║  ╚═════════════════════════════════════════════════════════════════════╝    ║
║                                    │                                         ║
║  ┌─────────────────────────────────────────────────────────────────────┐    ║
║  │                    طبقة الدعم (Support Layer)                       │    ║
║  │  Eval │ Monitor │ Curator │ Acquisition │ Alert │ Quality          │    ║
║  └─────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 🎚️ سُلَّم الاستقلالية (Autonomy Ladder)

| المستوى | الاسم | الوصف | أمثلة العمليات |
|---------|-------|-------|----------------|
| **L0** | قراءة فقط | بحث وعرض أدلة، لا تعديل | Semantic Search, Evidence Viewer |
| **L1** | اقتراح | يقترح روابط/دمج/استشهادات | Entity Extractor, Relation Proposer |
| **L2** | تنفيذ مراقَب | ينفّذ بعد تأكيد الباحث | Claim Crafter, Evidence Bundler |
| **L3** | تنفيذ مشروط | ينفّذ تلقائياً داخل شروط | Text Classifier, Auto-Indexer |
| **L4** | أتمتة محدودة | أعمال إدارية متكررة فقط | Link Checker, Index Updater |

**القاعدة الذهبية:** كلما ارتفع الخطر (حقوق/حذف/دمج/نشر) ← انخفضت الاستقلالية

---

## ⚠️ مستويات المخاطر (Risk Tiers)

| المستوى | الوصف | المراجعة المطلوبة | أمثلة |
|---------|-------|-------------------|-------|
| **R0** | لا مخاطر | لا شيء | قراءة، عرض |
| **R1** | مخاطر منخفضة | تلقائية | تصنيف، فهرسة |
| **R2** | مخاطر متوسطة | مراجعة آلية | ربط كيانات، استخراج |
| **R3** | مخاطر عالية | مراجعة بشرية | دمج كيانات، ادعاءات |
| **R4** | مخاطر حرجة | موافقة صريحة | نشر، حذف، تعديل schema |

---

## 🚨 الوكلاء ذات الأولوية القصوى (Priority-6)

| # | الوكيل | العملية | الحالة | الأهمية |
|---|--------|---------|--------|---------|
| 1 | **Semantic Search** | SEARCH | 🔴 غير منفذ | بوابة الدخول للمنظومة |
| 2 | **Entity Extractor** | LINK | 🔴 غير منفذ | أساس الربط والاستنتاج |
| 3 | **Evidence Bundler** | INFER | 🔴 غير منفذ | قلب منهجية الدليل-أولاً |
| 4 | **Claim Crafter** | INFER | 🔴 غير منفذ | إنتاج الادعاءات المنضبطة |
| 5 | **Cost Guardian** | GOVERNANCE | 🔴 غير منفذ | حماية من الإنفاق |
| 6 | **Publish Gate Checker** | GOVERNANCE | 🔴 غير منفذ | بوابة جودة النشر |

---

# 📖 الفهرس التفصيلي للوكلاء

---

## الفئة A: وكلاء البحث (SEARCH) - 8 وكلاء

### A1. Semantic Search Agent 🚨
```yaml
id: SEARCH-001
name_ar: وكيل البحث الدلالي
name_en: Semantic Search Agent
priority: P0 (أولوية قصوى)
status: 🔴 NOT_IMPLEMENTED
completion: 0%

contract:
  mission: |
    تمكين الباحث من البحث الدلالي العميق في 157 مليون مقطع نصي
    بفهم المعنى والسياق وليس مجرد مطابقة الكلمات.
  
  inputs:
    - query: string (سؤال/استعلام طبيعي)
    - corpus_filter: list[string] (تصفية الكوربسات)
    - time_range: tuple[date, date] (نطاق زمني)
    - language: string (لغة البحث)
    - max_results: int (الحد الأقصى للنتائج)
  
  outputs:
    - results: list[SearchResult]
      - passage_id: string
      - text: string
      - score: float (0-1)
      - source: SourceMetadata
      - context: ContextWindow
    - query_analysis: QueryAnalysis
    - cost_estimate: CostReport
  
  guarantees:
    - response_time: < 5 seconds for standard queries
    - accuracy: > 85% relevance in top-10
    - coverage: full corpus scan capability
  
  limitations:
    - لا يفهم السياق التاريخي العميق بدون Context Agent
    - لا يميز بين الطبعات والنسخ تلقائياً
    - يتطلب Vector Search مفعّل

autonomy_level: L0 (قراءة فقط)
risk_tier: R0 (لا مخاطر)

dependencies:
  requires:
    - BigQuery Tables: passages, documents
    - Vector Search Index (غير مفعّل حالياً)
  feeds:
    - Entity Extractor
    - Evidence Bundler
    - Context Enricher

tables_access:
  read: [passages, documents, sources, editions]
  write: [search_logs, query_analytics]

owner: فريق البحث
reviewer: مدير البيانات

evaluation:
  metrics:
    - precision@10
    - recall@100
    - mean_reciprocal_rank
    - query_latency
  benchmark: IQRA-SearchBench-v1
```

---

### A2. Keyword Search Agent
```yaml
id: SEARCH-002
name_ar: وكيل البحث بالكلمات المفتاحية
name_en: Keyword Search Agent
priority: P1
status: 🟡 PARTIAL (via BigQuery)
completion: 40%

contract:
  mission: |
    بحث تقليدي سريع بالكلمات المفتاحية والجذور العربية
    مع دعم البحث الضبابي والاشتقاقي.
  
  inputs:
    - keywords: list[string]
    - roots: list[string] (جذور عربية)
    - exact_match: bool
    - fuzzy_threshold: float
  
  outputs:
    - results: list[KeywordMatch]
    - frequency_stats: FrequencyReport
    - co_occurrence: CoOccurrenceMatrix

autonomy_level: L0
risk_tier: R0

dependencies:
  requires: [passages, fulltext_index]
  feeds: [Semantic Search, Entity Extractor]
```

---

### A3. Faceted Search Agent
```yaml
id: SEARCH-003
name_ar: وكيل البحث متعدد الأوجه
name_en: Faceted Search Agent
priority: P2
status: 🔴 NOT_IMPLEMENTED
completion: 0%

contract:
  mission: |
    توفير واجهة بحث تفاعلية مع فلاتر ديناميكية
    (زمن، مكان، مؤلف، موضوع، نوع النص).

autonomy_level: L0
risk_tier: R0
```

---

### A4. Citation Search Agent
```yaml
id: SEARCH-004
name_ar: وكيل البحث الاستشهادي
name_en: Citation Search Agent
priority: P2
status: 🔴 NOT_IMPLEMENTED
completion: 0%

contract:
  mission: |
    البحث في شبكة الاستشهادات: من يستشهد بمن؟
    تتبع سلاسل الإسناد والتأثر والتأثير.

autonomy_level: L0
risk_tier: R0
```

---

### A5. Temporal Search Agent
```yaml
id: SEARCH-005
name_ar: وكيل البحث الزمني
name_en: Temporal Search Agent
priority: P2
status: 🔴 NOT_IMPLEMENTED
completion: 0%

contract:
  mission: |
    البحث عبر الزمن: تتبع تطور مفهوم/مصطلح/فكرة
    عبر العصور والطبقات الزمنية.

autonomy_level: L0
risk_tier: R0
```

---

### A6. Similarity Search Agent
```yaml
id: SEARCH-006
name_ar: وكيل البحث بالتشابه
name_en: Similarity Search Agent
priority: P1
status: 🔴 NOT_IMPLEMENTED
completion: 0%

contract:
  mission: |
    إيجاد النصوص المشابهة لنص معين (إعادة استخدام نصي،
    اقتباسات، تناص، سرقات أدبية).

autonomy_level: L0
risk_tier: R1

dependencies:
  requires: [Vector Search Index]
  feeds: [Textual Genome Agent]
```

---

### A7. Query Expansion Agent
```yaml
id: SEARCH-007
name_ar: وكيل توسيع الاستعلام
name_en: Query Expansion Agent
priority: P2
status: 🔴 NOT_IMPLEMENTED
completion: 0%

contract:
  mission: |
    توسيع استعلام الباحث بالمرادفات والمصطلحات ذات الصلة
    والجذور والاشتقاقات.

autonomy_level: L1
risk_tier: R0
```

---

### A8. Search Recipe Manager
```yaml
id: SEARCH-008
name_ar: وكيل إدارة وصفات البحث
name_en: Search Recipe Manager
priority: P2
status: 🔴 NOT_IMPLEMENTED
completion: 0%

contract:
  mission: |
    حفظ واسترجاع وتشغيل وصفات البحث المركبة
    (Query Packs) القابلة لإعادة الاستخدام.

autonomy_level: L2
risk_tier: R1

tables_access:
  read: [recipes]
  write: [recipes, recipe_runs]
```

---

## الفئة B: وكلاء الربط (LINK) - 12 وكيل

### B1. Entity Extractor Agent 🚨
```yaml
id: LINK-001
name_ar: وكيل استخراج الكيانات
name_en: Entity Extractor Agent
priority: P0 (أولوية قصوى)
status: 🔴 NOT_IMPLEMENTED
completion: 0%

contract:
  mission: |
    استخراج الكيانات المسماة من النصوص: أعلام، أماكن،
    كتب، مذاهب، مصطلحات، تواريخ، أحداث.
  
  inputs:
    - text: string
    - entity_types: list[EntityType]
    - confidence_threshold: float
  
  outputs:
    - entities: list[ExtractedEntity]
      - text: string
      - type: EntityType
      - span: tuple[int, int]
      - confidence: float
      - normalized_form: string
      - candidates: list[EntityCandidate]
    - extraction_report: ExtractionReport
  
  guarantees:
    - precision: > 80% for persons
    - recall: > 70% for known entities
  
  limitations:
    - صعوبة مع الأسماء النادرة
    - التباس في الكنى والألقاب
    - يحتاج تدريب خاص للنصوص التراثية

autonomy_level: L1 (اقتراح)
risk_tier: R2 (مخاطر متوسطة)

dependencies:
  requires:
    - Semantic Search (للسياق)
    - NER Model (CAMeL-NER أو مشابه)
  feeds:
    - Entity Resolver
    - Relation Extractor
    - Evidence Bundler

tables_access:
  read: [passages, entities, entity_names]
  write: [extraction_queue, extraction_logs]

evaluation:
  metrics:
    - entity_precision
    - entity_recall
    - f1_score
    - type_accuracy
  benchmark: IQRA-NER-Bench-v1
```

---

### B2. Entity Resolver Agent
```yaml
id: LINK-002
name_ar: وكيل حسم هوية الكيانات
name_en: Entity Resolver Agent
priority: P1
status: 🔴 NOT_IMPLEMENTED

contract:
  mission: |
    حسم الالتباس في الكيانات المستخرجة: هل "الغزالي"
    هو أبو حامد أم أحمد الغزالي؟

autonomy_level: L1 (اقتراح)
risk_tier: R3 (مخاطر عالية - قد يدمج كيانات خطأ)
```

---

### B3. Relation Extractor Agent
```yaml
id: LINK-003
name_ar: وكيل استخراج العلاقات
name_en: Relation Extractor Agent
priority: P1
status: 🔴 NOT_IMPLEMENTED

contract:
  mission: |
    استخراج العلاقات بين الكيانات: تأثر، تلمذة،
    معاصرة، تأليف، اقتباس، نقد.

autonomy_level: L1
risk_tier: R2
```

---

### B4. Identity Queue Manager
```yaml
id: LINK-004
name_ar: وكيل طابور حسم الهوية
name_en: Identity Queue Manager
priority: P1
status: 🔴 NOT_IMPLEMENTED

contract:
  mission: |
    إدارة طابور الكيانات الملتبسة التي تنتظر
    المراجعة البشرية للحسم النهائي.

autonomy_level: L2
risk_tier: R3
```

---

### B5. Entity Merger Agent
```yaml
id: LINK-005
name_ar: وكيل دمج الكيانات
name_en: Entity Merger Agent
priority: P2
status: 🔴 NOT_IMPLEMENTED

contract:
  mission: |
    دمج الكيانات المكررة في كيان واحد موحد
    مع الحفاظ على سلسلة الأصل.

autonomy_level: L2 (يحتاج تأكيد بشري)
risk_tier: R4 (حرج - تغيير دائم)
```

---

### B6. Graph Builder Agent
```yaml
id: LINK-006
name_ar: وكيل بناء الرسم البياني
name_en: Graph Builder Agent
priority: P2
status: 🔴 NOT_IMPLEMENTED

contract:
  mission: |
    بناء وتحديث رسم بياني للمعرفة من الكيانات
    والعلاقات المستخرجة والموثقة.

autonomy_level: L3
risk_tier: R2
```

---

### B7. Citation Linker Agent
```yaml
id: LINK-007
name_ar: وكيل ربط الاستشهادات
name_en: Citation Linker Agent
priority: P1
status: 🔴 NOT_IMPLEMENTED

contract:
  mission: |
    ربط الاستشهادات في النصوص بمصادرها الأصلية
    في قاعدة البيانات.

autonomy_level: L1
risk_tier: R2
```

---

### B8. Isnad Analyzer Agent
```yaml
id: LINK-008
name_ar: وكيل تحليل الأسانيد
name_en: Isnad Analyzer Agent
priority: P2
status: 🔴 NOT_IMPLEMENTED

contract:
  mission: |
    تحليل سلاسل الإسناد في الأحاديث والروايات:
    استخراج الرواة، بناء شجرة الإسناد، تقييم الاتصال.

autonomy_level: L1
risk_tier: R2
domain: حديث وعلوم الرواية
```

---

### B9. Textual Genome Agent
```yaml
id: LINK-009
name_ar: وكيل الجينوم النصي
name_en: Textual Genome Agent
priority: P2
status: 🔴 NOT_IMPLEMENTED

contract:
  mission: |
    تتبع إعادة الاستخدام النصي عبر الكتب والعصور
    (منهجية Sarah Bowen Savant).

autonomy_level: L0
risk_tier: R1
reference: "Savant, Sarah Bowen - The Textual Genome"
```

---

### B10. Lexical Tracer Agent
```yaml
id: LINK-010
name_ar: وكيل التتبع المعجمي
name_en: Lexical Tracer Agent
priority: P2
status: 🔴 NOT_IMPLEMENTED

contract:
  mission: |
    تتبع تطور المصطلحات عبر اللغات والثقافات:
    يوناني ← سرياني ← عربي ← لاتيني.

autonomy_level: L0
risk_tier: R1
```

---

### B11. Cross-Reference Agent
```yaml
id: LINK-011
name_ar: وكيل الإحالات المتقاطعة
name_en: Cross-Reference Agent
priority: P2
status: 🔴 NOT_IMPLEMENTED

autonomy_level: L0
risk_tier: R0
```

---

### B12. Edition Linker Agent
```yaml
id: LINK-012
name_ar: وكيل ربط الطبعات
name_en: Edition Linker Agent
priority: P2
status: 🔴 NOT_IMPLEMENTED

contract:
  mission: |
    ربط الطبعات والنسخ المختلفة للكتاب الواحد
    وتتبع الفروق بينها.

autonomy_level: L1
risk_tier: R2
```

---

## الفئة C: وكلاء الاستنتاج (INFER) - 15 وكيل

### C1. Evidence Bundler Agent 🚨
```yaml
id: INFER-001
name_ar: وكيل تجميع الأدلة
name_en: Evidence Bundler Agent
priority: P0 (أولوية قصوى)
status: 🔴 NOT_IMPLEMENTED
completion: 0%

contract:
  mission: |
    تجميع الشواهد النصية المتعلقة بموضوع/سؤال معين
    في حزمة موثقة ومنظمة قابلة للتدقيق.
    *** هذا قلب منهجية "الدليل-أولاً" ***
  
  inputs:
    - research_question: string
    - search_results: list[SearchResult]
    - quality_threshold: float
    - max_evidence: int
  
  outputs:
    - evidence_bundle: EvidenceBundle
      - bundle_id: string
      - question: string
      - items: list[EvidenceItem]
        - passage_id: string
        - text: string
        - source: Citation
        - relevance_score: float
        - context: ContextWindow
        - extraction_method: string
      - quality_score: float
      - coverage_assessment: CoverageReport
      - provenance: ProvenanceChain
  
  guarantees:
    - كل دليل له مصدر موثق
    - كل دليل له سياق كافٍ
    - كل دليل قابل للتحقق
  
  limitations:
    - لا يقيّم صحة المحتوى، فقط الصلة
    - يحتاج مراجعة بشرية للجودة النهائية

autonomy_level: L2 (تنفيذ مراقَب)
risk_tier: R2

dependencies:
  requires:
    - Semantic Search
    - Entity Extractor
  feeds:
    - Claim Crafter
    - Counter-Evidence Agent
    - Academic Writer

tables_access:
  read: [passages, documents, search_logs]
  write: [evidence_bundles, evidence_items]

evaluation:
  metrics:
    - evidence_relevance
    - source_diversity
    - context_adequacy
    - provenance_completeness
```

---

### C2. Claim Crafter Agent 🚨
```yaml
id: INFER-002
name_ar: وكيل صياغة الادعاءات
name_en: Claim Crafter Agent
priority: P0 (أولوية قصوى)
status: 🔴 NOT_IMPLEMENTED
completion: 0%

contract:
  mission: |
    صياغة ادعاءات أكاديمية منضبطة من حزم الأدلة
    مع تحديد النوع والنطاق ودرجة الثقة وشروط الدحض.
    *** تطبيق نموذج Toulmin للحجج ***
  
  inputs:
    - evidence_bundle: EvidenceBundle
    - claim_type: enum[DESCRIPTIVE, ANALYTICAL, NORMATIVE]
    - scope_constraints: ScopeDefinition
  
  outputs:
    - claim: Claim
      - claim_id: string
      - text: string
      - type: ClaimType
      - scope: ScopeDefinition
        - temporal: TimeRange
        - geographic: list[Place]
        - domain: list[Domain]
      - confidence: float (0-1)
      - evidence_ids: list[string]
      - warrant: string (الضمان المنطقي)
      - backing: string (الدعم الإضافي)
      - qualifier: string (المشروطية)
      - rebuttal_conditions: list[string] (شروط الدحض)
    - alternative_claims: list[Claim]
    - gaps_identified: list[Gap]
  
  guarantees:
    - لا ادعاء بدون evidence_ids
    - كل ادعاء له نوع ونطاق محدد
    - كل ادعاء له شروط دحض

autonomy_level: L2 (تنفيذ مراقَب)
risk_tier: R3 (مخاطر عالية)

dependencies:
  requires: [Evidence Bundler]
  feeds: [Counter-Evidence, Argument Builder, Academic Writer]

tables_access:
  read: [evidence_bundles]
  write: [claims, claim_evidence_map]

reference: "Toulmin, Stephen - The Uses of Argument"
```

---

### C3. Counter-Evidence Agent
```yaml
id: INFER-003
name_ar: وكيل الأدلة المضادة
name_en: Counter-Evidence Agent
priority: P1
status: 🔴 NOT_IMPLEMENTED

contract:
  mission: |
    البحث عن الأدلة المضادة لادعاء معين
    والحجج المنافسة والاعتراضات التاريخية.
    *** تطبيق مبدأ بوبر في القابلية للتكذيب ***

autonomy_level: L1
risk_tier: R2
reference: "Popper, Karl - Logic of Scientific Discovery"
```

---

### C4. Argument Builder Agent
```yaml
id: INFER-004
name_ar: وكيل بناء الحجج
name_en: Argument Builder Agent
priority: P1
status: 🔴 NOT_IMPLEMENTED

contract:
  mission: |
    بناء حجة متكاملة وفق نموذج Toulmin:
    ادعاء + بيانات + ضمان + دعم + مشروطية + دحض.

autonomy_level: L2
risk_tier: R2
reference: "Toulmin, Stephen - The Uses of Argument"
```

---

### C5. Fallacy Detector Agent
```yaml
id: INFER-005
name_ar: وكيل كشف المغالطات
name_en: Fallacy Detector Agent
priority: P2
status: 🔴 NOT_IMPLEMENTED

contract:
  mission: |
    كشف المغالطات المنطقية في الحجج والنصوص:
    الانزلاق، التعميم، السلطة، رجل القش...

autonomy_level: L1
risk_tier: R1
```

---

### C6. Inference Engine Agent
```yaml
id: INFER-006
name_ar: وكيل محرك الاستنتاج
name_en: Inference Engine Agent
priority: P2
status: 🔴 NOT_IMPLEMENTED

contract:
  mission: |
    تنفيذ استنتاجات منطقية من القواعد والحقائق
    (استنتاج رمزي + احتمالي).

autonomy_level: L2
risk_tier: R2
reference: "Marcus, Gary - Neurosymbolic AI"
```

---

### C7. Hypothesis Generator Agent
```yaml
id: INFER-007
name_ar: وكيل توليد الفرضيات
name_en: Hypothesis Generator Agent
priority: P2
status: 🔴 NOT_IMPLEMENTED

contract:
  mission: |
    توليد فرضيات بحثية جديدة من الفجوات
    والأنماط المكتشفة في البيانات.

autonomy_level: L1
risk_tier: R2
reference: "Stanley, Kenneth - Novelty Search"
```

---

### C8. Coherence Evaluator Agent
```yaml
id: INFER-008
name_ar: وكيل تقييم التماسك
name_en: Coherence Evaluator Agent
priority: P2
status: 🔴 NOT_IMPLEMENTED

contract:
  mission: |
    تقييم التماسك التفسيري بين الفرضيات المتنافسة
    (شبكة ECHO لـ Thagard).

autonomy_level: L1
risk_tier: R2
reference: "Thagard, Paul - Coherence in Thought and Action"
```

---

### C9-C15. (باقي وكلاء الاستنتاج)
```yaml
# C9: Analogy Finder Agent
# C10: Pattern Recognizer Agent
# C11: Causal Analyzer Agent
# C12: Comparative Analyzer Agent
# C13: Context Enricher Agent
# C14: Sentiment Analyzer Agent
# C15: Abductive Reasoner Agent

status: 🔴 NOT_IMPLEMENTED
# التفاصيل في الوثيقة الكاملة
```

---

## الفئة D: وكلاء التركيب (SYNTHESIZE) - 10 وكلاء

### D1. Report Generator Agent
```yaml
id: SYNTH-001
name_ar: وكيل توليد التقارير
name_en: Report Generator Agent
priority: P1
status: 🔴 NOT_IMPLEMENTED

contract:
  mission: |
    توليد تقارير بحثية منظمة من الادعاءات والأدلة
    مع التوثيق الكامل والبنية الواضحة.

autonomy_level: L2
risk_tier: R2
```

---

### D2. Academic Writer Agent
```yaml
id: SYNTH-002
name_ar: وكيل الكتابة الأكاديمية
name_en: Academic Writer Agent
priority: P1
status: 🔴 NOT_IMPLEMENTED

contract:
  mission: |
    مساعدة الباحث في كتابة نصوص أكاديمية رصينة
    مع الحفاظ على صوته وأسلوبه.
  
  guarantees:
    - كل جملة تحليلية مرتبطة بدليل
    - لا كتابة إنشائية بلا سند
  
  limitations:
    - لا يكتب النص النهائي، فقط مسودات
    - يحتاج مراجعة بشرية

autonomy_level: L2
risk_tier: R2
```

---

### D3-D10. (باقي وكلاء التركيب)
```yaml
# D3: Outline Builder Agent
# D4: Citation Auditor Agent
# D5: Summary Generator Agent
# D6: Concept Map Builder Agent
# D7: Timeline Builder Agent
# D8: Glossary Builder Agent
# D9: Bibliography Manager Agent
# D10: Presentation Builder Agent

status: 🔴 NOT_IMPLEMENTED
```

---

## الفئة E: وكلاء بناء الأنساق (BUILD) - 8 وكلاء

### E1. Ontology Builder Agent
```yaml
id: BUILD-001
name_ar: وكيل بناء الأنطولوجيا
name_en: Ontology Builder Agent
priority: P2
status: 🔴 NOT_IMPLEMENTED

contract:
  mission: |
    بناء وتطوير الأنطولوجيا المعرفية لإقرأ-12:
    المفاهيم، التصنيفات، العلاقات.

autonomy_level: L2
risk_tier: R4 (حرج)
reference: "Guarino, Nicola - DOLCE Ontology"
```

---

### E2-E8. (باقي وكلاء البناء)
```yaml
# E2: Theory Builder Agent
# E3: Schema Evolution Agent
# E4: Pattern Library Agent
# E5: Test Suite Builder Agent
# E6: Knowledge Curator Agent
# E7: Version Manager Agent
# E8: Integration Agent

status: 🔴 NOT_IMPLEMENTED
```

---

## الفئة F: وكلاء الحوكمة (GOVERNANCE) - 8 وكلاء

### F1. Cost Guardian Agent 🚨
```yaml
id: GOV-001
name_ar: وكيل حراسة التكلفة
name_en: Cost Guardian Agent
priority: P0 (أولوية قصوى)
status: 🔴 NOT_IMPLEMENTED
completion: 0%

contract:
  mission: |
    حماية المشروع من الإنفاق غير المنضبط على BigQuery:
    مراقبة، تنبيه، إيقاف طارئ.
    *** لا تشغيل ثقيل بلا تقدير كلفة ***
  
  inputs:
    - query: BigQueryQuery
    - project_budget: Budget
    - session_limit: float
  
  outputs:
    - cost_estimate: CostEstimate
      - bytes_to_scan: int
      - estimated_cost: float
      - tier: CostTier
    - approval_status: ApprovalStatus
    - budget_status: BudgetStatus
  
  actions:
    - preview_cost: تقدير قبل التنفيذ
    - approve_query: الموافقة على التنفيذ
    - block_query: منع التنفيذ
    - circuit_breaker: إيقاف طارئ
  
  guarantees:
    - لا استعلام > $X بدون موافقة
    - تنبيه عند 80% من الميزانية
    - إيقاف تلقائي عند 100%
  
  thresholds:
    auto_approve: < $0.10
    warn: $0.10 - $1.00
    require_approval: $1.00 - $10.00
    block: > $10.00

autonomy_level: L3 (تنفيذ مشروط)
risk_tier: R2

tables_access:
  read: [INFORMATION_SCHEMA.JOBS]
  write: [cost_logs, budget_alerts]

reference: "Storment, J.R. & Reis, J. - Cloud FinOps"
```

---

### F2. Publish Gate Checker Agent 🚨
```yaml
id: GOV-002
name_ar: وكيل بوابة النشر
name_en: Publish Gate Checker Agent
priority: P0 (أولوية قصوى)
status: 🔴 NOT_IMPLEMENTED
completion: 0%

contract:
  mission: |
    بوابة جودة إلزامية قبل النشر الداخلي:
    لا نشر بدون اجتياز جميع الفحوصات.
    *** لا نشر بلا سلسلة أصل كاملة ***
  
  checklist:
    - Evidence ✅: كل ادعاء له أدلة
    - Citation ✅: كل اقتباس موثق
    - Provenance ✅: سلسلة أصل كاملة
    - Reproducible ✅: قابل لإعادة البناء
    - Rights ✅: حقوق الاستخدام واضحة
    - Review ✅: مراجعة بشرية تمت

autonomy_level: L2
risk_tier: R3

tables_access:
  read: [assets, evidence_bundles, citations, provenance]
  write: [gate_results, publish_log]
```

---

### F3-F8. (باقي وكلاء الحوكمة)
```yaml
# F3: Rights Manager Agent
# F4: Decision Logger Agent
# F5: Audit Agent
# F6: Provenance Tracker Agent (ref: Moreau, Luc - W3C PROV)
# F7: Compliance Checker Agent
# F8: Incident Manager Agent

status: 🔴 NOT_IMPLEMENTED
```

---

## الفئة G: وكلاء الدعم (SUPPORT) - 9 وكلاء

### G1. Unified Pipeline Agent ✅
```yaml
id: SUPPORT-001
name_ar: وكيل خط الأنابيب الموحد
name_en: Unified Pipeline Agent
priority: P0
status: 🟡 PARTIAL
completion: 80%

implementation_notes:
  - الهيكل الأساسي موجود
  - يحتاج ربط مع الوكلاء الجدد

autonomy_level: L3
risk_tier: R2
```

---

### G2. Gemini Classifier Agent ✅
```yaml
id: SUPPORT-002
name_ar: وكيل التصنيف بجيميني
name_en: Gemini Classifier Agent
priority: P0
status: 🟢 IMPLEMENTED
completion: 90%

implementation_notes:
  - يعمل مع Vertex AI
  - API key مفعّل

autonomy_level: L3
risk_tier: R1
```

---

### G3. Text Classifier Agent ✅
```yaml
id: SUPPORT-003
name_ar: وكيل التصنيف النصي
name_en: Text Classifier Agent
priority: P1
status: 🟢 IMPLEMENTED
completion: 85%

autonomy_level: L3
risk_tier: R1
```

---

### G4. Journal Acquisition Agent ✅
```yaml
id: SUPPORT-004
name_ar: وكيل اقتناء الدوريات
name_en: Journal Acquisition Agent
priority: P1
status: 🟢 IMPLEMENTED
completion: 85%

autonomy_level: L3
risk_tier: R1
```

---

### G5. Methodology Consultant Agent
```yaml
id: SUPPORT-005
name_ar: وكيل الاستشارة المنهجية
name_en: Methodology Consultant Agent
priority: P1
status: 🟡 PARTIAL
completion: 60%

autonomy_level: L1
risk_tier: R0
```

---

### G6-G9. (باقي وكلاء الدعم)
```yaml
# G6: Monitor Agent
# G7: Eval Agent (ref: Liang, Percy - HELM)
# G8: Academic Alert Agent
# G9: Genius Spark Agent

status: 🔴 NOT_IMPLEMENTED
```

---

## الفئة H: وكلاء التراث المتخصصة (HERITAGE) - 10 وكلاء

```yaml
# H1: Quran Analysis Agent
# H2: Hadith Analyzer Agent
# H3: Fiqh Navigator Agent
# H4: Kalam Agent
# H5: Tasawwuf Agent
# H6: Philosophy Agent
# H7: History Agent
# H8: Arabic Language Agent
# H9: Manuscript Agent
# H10: Cross-Cultural Agent

status: 🔴 NOT_IMPLEMENTED
priority: P2-P3
```

---

# 📊 ملخص الحالة العامة

## إحصائيات التنفيذ

| الفئة | إجمالي | منفذ | جزئي | غير منفذ |
|-------|--------|------|------|----------|
| A: البحث (SEARCH) | 8 | 0 | 1 | 7 |
| B: الربط (LINK) | 12 | 0 | 0 | 12 |
| C: الاستنتاج (INFER) | 15 | 0 | 0 | 15 |
| D: التركيب (SYNTHESIZE) | 10 | 0 | 0 | 10 |
| E: بناء الأنساق (BUILD) | 8 | 0 | 0 | 8 |
| F: الحوكمة (GOVERNANCE) | 8 | 0 | 0 | 8 |
| G: الدعم (SUPPORT) | 9 | 3 | 2 | 4 |
| H: التراث (HERITAGE) | 10 | 0 | 0 | 10 |
| **المجموع** | **80** | **3** | **3** | **74** |

---

## مصفوفة الاعتماديات الحرجة

```
┌─────────────────────────────────────────────────────────────────┐
│                   مسار التدفق الأساسي                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Semantic Search ──────┬──────► Entity Extractor                │
│                        │                                        │
│                        └──────► Evidence Bundler                │
│                                       │                         │
│                                       ▼                         │
│                               Claim Crafter                     │
│                                       │                         │
│                        ┌──────────────┼──────────────┐          │
│                        ▼              ▼              ▼          │
│                Counter-Evidence  Argument Builder  Academic     │
│                                       │            Writer       │
│                                       ▼                         │
│                              Publish Gate Checker               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## خطة التنفيذ المقترحة

### المرحلة 1: الأساسيات (الأسبوع 1-2)
| الترتيب | الوكيل | السبب |
|---------|--------|-------|
| 1 | Cost Guardian | حماية الميزانية أولاً |
| 2 | Publish Gate Checker | ضمان الجودة من البداية |
| 3 | Semantic Search | بوابة الدخول للمنظومة |
| 4 | Entity Extractor | أساس الربط |

### المرحلة 2: الاستنتاج (الأسبوع 3-4)
| الترتيب | الوكيل | السبب |
|---------|--------|-------|
| 5 | Evidence Bundler | قلب منهجية الدليل-أولاً |
| 6 | Claim Crafter | إنتاج الادعاءات |
| 7 | Counter-Evidence | التحقق النقدي |
| 8 | Citation Auditor | ضمان التوثيق |

### المرحلة 3: التركيب (الأسبوع 5-6)
| الترتيب | الوكيل | السبب |
|---------|--------|-------|
| 9 | Report Generator | إنتاج المخرجات |
| 10 | Academic Writer | مساعدة الباحث |
| 11 | Outline Builder | تنظيم البحث |

### المرحلة 4: التوسع (الأسبوع 7+)
- باقي الوكلاء حسب الأولوية والحاجة

---

# 📎 الملاحق

## ملحق أ: قاموس المصطلحات

| المصطلح | التعريف |
|---------|---------|
| Evidence Bundle | حزمة شواهد موثقة ومنظمة |
| Claim | ادعاء أكاديمي منضبط مع نطاق وشروط دحض |
| Provenance | سلسلة الأصل والتتبع من المصدر للمخرج |
| Autonomy Level | مستوى استقلالية الوكيل (L0-L4) |
| Risk Tier | مستوى المخاطر (R0-R4) |
| Gate | بوابة فحص وجودة إلزامية |
| Toulmin Model | نموذج الحجة: ادعاء + بيانات + ضمان + دعم + مشروطية + دحض |

## ملحق ب: المراجع الأساسية

1. **Toulmin, Stephen** - "The Uses of Argument" (نموذج الحجج)
2. **Moreau, Luc** - "W3C PROV Specification" (سلاسل الأصل)
3. **Liang, Percy** - "HELM: Holistic Evaluation" (تقييم الوكلاء)
4. **Guarino, Nicola** - "DOLCE Ontology" (الأنطولوجيا)
5. **Savant, Sarah Bowen** - "Textual Genome" (إعادة الاستخدام النصي)
6. **Shneiderman, Ben** - "Human-Centered AI" (التحكم البشري)
7. **Norman, Don** - "The Design of Everyday Things" (تصميم التجربة)
8. **Popper, Karl** - "Logic of Scientific Discovery" (القابلية للتكذيب)
9. **Thagard, Paul** - "Coherence in Thought and Action" (التماسك)
10. **Storment & Reis** - "Cloud FinOps" (إدارة التكلفة)

---

**نهاية سجل الوكلاء - الإصدار 1.0**

*آخر تحديث: 21 ديسمبر 2025*
*إعداد: Claude (Anthropic) بالتعاون مع فريق إقرأ-12*
