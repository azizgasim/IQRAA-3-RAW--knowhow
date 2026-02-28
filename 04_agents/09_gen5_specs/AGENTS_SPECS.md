# 📋 مواصفات الوكلاء الناقصة - إقرأ-12
## Agent Specifications for Missing Agents

**التاريخ:** 2025-12-22
**الإصدار:** 2.0
**عدد الوكلاء:** 12 وكيل

---

## 📊 ملخص الوكلاء

| # | الوكيل | البوابة | النوع | الأولوية |
|---|--------|---------|-------|----------|
| 1 | QueryExpander | 🔍 اكتشف | جديد | 🔴 عالية |
| 2 | KnowledgeExplorer | 🔍 اكتشف | جديد | 🔴 عالية |
| 3 | Suggester | 🔍 اكتشف | جديد | 🟡 متوسطة |
| 4 | RelationProposer | 🔗 اربط | جديد | 🔴 عالية |
| 5 | NetworkAnalyzer | 🔗 اربط | جديد | 🔴 عالية |
| 6 | ClaimValidator | 💡 افهم | دمج | 🔴 عالية |
| 7 | EvidenceWriter | 📝 أنتج | جديد | 🟡 متوسطة |
| 8 | OutlineBuilder | 📝 أنتج | جديد | 🟡 متوسطة |
| 9 | QualityChecker | 📝 أنتج | دمج | 🟢 منخفضة |
| 10 | QueryTuner | ⚙️ أدِر | جديد | 🟢 منخفضة |
| 11 | TrainingCompanion | ⚙️ أدِر | جديد | 🟢 منخفضة |
| 12 | SystemHealth | ⚙️ أدِر | دمج | 🟡 متوسطة |

---

## ═══════════════════════════════════════════════════════════════
## 🔍 بوابة اكتشف (3 وكلاء)
## ═══════════════════════════════════════════════════════════════

---

## 1️⃣ QueryExpander (التوسيع الدلالي)

### المعلومات الأساسية
```yaml
id: query_expander
name: QueryExpanderAgent
name_ar: التوسيع الدلالي
gate: discover
category: search
cost: 0.01
time_seconds: 2
priority: HIGH
```

### الغرض
توسيع استعلام البحث بإضافة مرادفات ومصطلحات قريبة دلالياً لزيادة شمولية النتائج.

### المدخلات (Inputs)
```typescript
interface QueryExpanderInput {
  query: string;              // الاستعلام الأصلي
  language: "ar" | "en";      // لغة الاستعلام
  expansion_level: "light" | "medium" | "deep";  // مستوى التوسيع
  domain?: string;            // المجال (فقه، حديث، تفسير...)
  max_synonyms?: number;      // الحد الأقصى للمرادفات (افتراضي: 5)
  include_root?: boolean;     // تضمين الجذر اللغوي
}
```

### المخرجات (Outputs)
```typescript
interface QueryExpanderOutput {
  original_query: string;
  expanded_queries: ExpandedQuery[];
  total_terms: number;
  expansion_map: Map<string, string[]>;  // الكلمة → مرادفاتها
}

interface ExpandedQuery {
  query: string;
  confidence: number;      // 0-1
  expansion_type: "synonym" | "root" | "related" | "technical";
  source: string;          // مصدر المرادف
}
```

### خوارزمية العمل
```
1. تحليل الاستعلام (Tokenization)
   ├── فصل الكلمات
   ├── إزالة حروف الجر والعطف
   └── تحديد الكلمات المفتاحية

2. استخراج الجذور (Root Extraction)
   ├── استخدام مكتبة الصرف العربي
   └── ربط الكلمة بجذرها الثلاثي

3. البحث عن المرادفات
   ├── قاموس المرادفات العربية
   ├── المصطلحات الشرعية
   └── Embeddings للتشابه الدلالي

4. الترتيب والفلترة
   ├── حساب الثقة لكل مرادف
   ├── إزالة المكرر
   └── ترتيب حسب الصلة

5. بناء الاستعلامات الموسعة
   └── دمج المرادفات في استعلامات متعددة
```

### التبعيات
```yaml
internal:
  - Arabic Morphology Library (qalsadi/pyarabic)
  - Synonyms Database
  - Islamic Terms Dictionary
external:
  - OpenAI Embeddings (للتشابه الدلالي)
```

### التكامل
```yaml
يستدعيه:
  - semantic_searcher (قبل البحث)
  - knowledge_explorer (في الاستكشاف)
  - playbook_scan (المرحلة 2)
  
يستدعي:
  - لا يستدعي وكلاء آخرين
```

### مثال استخدام
```python
# Input
{
  "query": "حكم الربا",
  "language": "ar",
  "expansion_level": "medium",
  "domain": "فقه"
}

# Output
{
  "original_query": "حكم الربا",
  "expanded_queries": [
    {"query": "حكم الربا الفضل", "confidence": 0.95, "expansion_type": "related"},
    {"query": "حكم الربا النسيئة", "confidence": 0.93, "expansion_type": "related"},
    {"query": "تحريم الفائدة", "confidence": 0.85, "expansion_type": "synonym"},
    {"query": "حكم القرض بفائدة", "confidence": 0.80, "expansion_type": "related"}
  ],
  "expansion_map": {
    "الربا": ["الفائدة", "الزيادة المحرمة", "ربا الفضل", "ربا النسيئة"],
    "حكم": ["فتوى", "رأي", "قول"]
  }
}
```

---

## 2️⃣ KnowledgeExplorer (مستكشف المعرفة)

### المعلومات الأساسية
```yaml
id: knowledge_explorer
name: KnowledgeExplorerAgent
name_ar: مستكشف المعرفة
gate: discover
category: search
cost: 0.05
time_seconds: 15
priority: HIGH
```

### الغرض
رحلة استكشافية موجهة في التراث الإسلامي، تبدأ من نقطة وتتفرع لاكتشاف المفاهيم المرتبطة.

### المدخلات (Inputs)
```typescript
interface KnowledgeExplorerInput {
  starting_point: string;           // نقطة البداية (مفهوم، عالم، كتاب)
  exploration_depth: 1 | 2 | 3;     // عمق الاستكشاف
  exploration_type: "concept" | "person" | "book" | "topic";
  filters?: {
    time_period?: [number, number]; // الفترة الزمنية
    madhab?: string[];              // المذاهب
    domain?: string[];              // المجالات
  };
  max_nodes?: number;               // الحد الأقصى للعقد (افتراضي: 20)
}
```

### المخرجات (Outputs)
```typescript
interface KnowledgeExplorerOutput {
  starting_node: ExplorationNode;
  exploration_tree: ExplorationNode[];
  connections: Connection[];
  summary: string;
  suggested_paths: SuggestedPath[];
}

interface ExplorationNode {
  id: string;
  name: string;
  type: "concept" | "person" | "book" | "event";
  description: string;
  relevance_score: number;
  depth_level: number;
  metadata: Record<string, any>;
}

interface Connection {
  from_id: string;
  to_id: string;
  relation_type: string;
  strength: number;
}

interface SuggestedPath {
  name: string;
  nodes: string[];
  description: string;
}
```

### خوارزمية العمل
```
1. تحليل نقطة البداية
   ├── تحديد النوع (مفهوم/شخص/كتاب)
   ├── استخراج الخصائص
   └── تحديد العلاقات المباشرة

2. بناء المستوى الأول
   ├── البحث عن الكيانات المرتبطة مباشرة
   ├── تصنيف العلاقات
   └── حساب قوة الارتباط

3. التوسع للمستويات التالية (حسب depth)
   ├── لكل عقدة في المستوى الحالي
   │   ├── البحث عن الارتباطات
   │   └── إضافة العقد الجديدة
   └── تجنب التكرار (visited set)

4. الفلترة والترتيب
   ├── تطبيق الفلاتر (زمن، مذهب، مجال)
   ├── حساب الصلة
   └── اختيار أفضل N عقدة

5. اقتراح مسارات
   └── تحديد مسارات استكشاف مثيرة للاهتمام
```

### التكامل
```yaml
يستدعيه:
  - واجهة المستخدم (زر الاستكشاف)
  - playbook_explore
  
يستدعي:
  - entity_extractor
  - semantic_searcher
  - network_analyzer
```

### مثال استخدام
```python
# Input
{
  "starting_point": "ابن تيمية",
  "exploration_depth": 2,
  "exploration_type": "person",
  "max_nodes": 15
}

# Output
{
  "starting_node": {
    "id": "scholar_001",
    "name": "ابن تيمية",
    "type": "person",
    "description": "شيخ الإسلام أحمد بن عبد الحليم..."
  },
  "exploration_tree": [
    {"id": "scholar_002", "name": "ابن القيم", "type": "person", "depth_level": 1},
    {"id": "book_001", "name": "مجموع الفتاوى", "type": "book", "depth_level": 1},
    {"id": "concept_001", "name": "العقيدة الواسطية", "type": "concept", "depth_level": 1},
    {"id": "scholar_003", "name": "الذهبي", "type": "person", "depth_level": 2}
  ],
  "suggested_paths": [
    {"name": "المدرسة الحنبلية", "nodes": ["ابن تيمية", "ابن القيم", "محمد بن عبد الوهاب"]},
    {"name": "مؤلفاته في العقيدة", "nodes": ["العقيدة الواسطية", "الحموية", "التدمرية"]}
  ]
}
```

---

## 3️⃣ Suggester (المقترح الذكي)

### المعلومات الأساسية
```yaml
id: suggester
name: SuggesterAgent
name_ar: المقترح الذكي
gate: discover
category: search
cost: 0.01
time_seconds: 2
priority: MEDIUM
```

### الغرض
تقديم اقتراحات ذكية بناءً على سياق البحث وسلوك المستخدم ("قد يعجبك أيضاً").

### المدخلات (Inputs)
```typescript
interface SuggesterInput {
  context: {
    current_query?: string;
    current_results?: string[];
    viewed_items?: string[];
    session_history?: string[];
  };
  suggestion_type: "query" | "entity" | "document" | "topic";
  count: number;  // عدد الاقتراحات (افتراضي: 5)
  user_profile?: {
    interests?: string[];
    expertise_level?: "beginner" | "intermediate" | "expert";
  };
}
```

### المخرجات (Outputs)
```typescript
interface SuggesterOutput {
  suggestions: Suggestion[];
  reasoning: string;
}

interface Suggestion {
  id: string;
  type: "query" | "entity" | "document" | "topic";
  content: string;
  confidence: number;
  reason: string;  // لماذا هذا الاقتراح
}
```

### خوارزمية العمل
```
1. تحليل السياق
   ├── استخراج الموضوعات من البحث الحالي
   ├── تحليل سجل الجلسة
   └── تحديد اهتمامات المستخدم

2. توليد الاقتراحات
   ├── اقتراحات مبنية على المحتوى (content-based)
   ├── اقتراحات مبنية على التشابه (collaborative)
   └── اقتراحات استكشافية (serendipity)

3. الترتيب والتنويع
   ├── حساب الثقة لكل اقتراح
   ├── ضمان التنوع (diversity)
   └── مراعاة مستوى الخبرة

4. إضافة التبريرات
   └── توليد سبب لكل اقتراح
```

---

## ═══════════════════════════════════════════════════════════════
## 🔗 بوابة اربط (2 وكلاء)
## ═══════════════════════════════════════════════════════════════

---

## 4️⃣ RelationProposer (مقترح الروابط)

### المعلومات الأساسية
```yaml
id: relation_proposer
name: RelationProposerAgent
name_ar: مقترح الروابط
gate: link
category: link
cost: 0.02
time_seconds: 5
priority: HIGH
```

### الغرض
اقتراح روابط محتملة بين الكيانات بناءً على السياق والمعرفة المخزنة.

### المدخلات (Inputs)
```typescript
interface RelationProposerInput {
  source_entity: Entity;
  target_entity?: Entity;        // إذا فارغ، يقترح كيانات للربط
  context?: string;              // السياق النصي
  relation_types?: string[];     // أنواع العلاقات المطلوبة
  min_confidence?: number;       // الحد الأدنى للثقة (افتراضي: 0.5)
}

interface Entity {
  id?: string;
  name: string;
  type: "person" | "book" | "concept" | "place" | "event";
  attributes?: Record<string, any>;
}
```

### المخرجات (Outputs)
```typescript
interface RelationProposerOutput {
  proposed_relations: ProposedRelation[];
  alternative_targets?: Entity[];  // إذا لم يُحدد target
}

interface ProposedRelation {
  source: Entity;
  target: Entity;
  relation_type: string;
  relation_label_ar: string;
  confidence: number;
  evidence: Evidence[];
  is_bidirectional: boolean;
}
```

### أنواع العلاقات المدعومة
```yaml
شخص ↔ شخص:
  - تلميذ/شيخ
  - معاصر
  - ناقد/منتقد
  - مؤيد
  - قريب (نسب)

شخص ↔ كتاب:
  - مؤلف
  - شارح
  - محقق
  - ناقد

شخص ↔ مفهوم:
  - مؤسس
  - مطور
  - معارض
  - متبنٍ

كتاب ↔ كتاب:
  - شرح
  - اختصار
  - رد
  - تكملة

مفهوم ↔ مفهوم:
  - جزء من
  - مقابل
  - سبب/نتيجة
  - شرط
```

---

## 5️⃣ NetworkAnalyzer (محلل الشبكة)

### المعلومات الأساسية
```yaml
id: network_analyzer
name: NetworkAnalyzerAgent
name_ar: محلل الشبكة
gate: link
category: link
cost: 0.04
time_seconds: 10
priority: HIGH
```

### الغرض
تحليل بنية شبكة العلاقات واكتشاف الأنماط ومراكز الثقل والمجتمعات.

### المدخلات (Inputs)
```typescript
interface NetworkAnalyzerInput {
  entities: Entity[];           // الكيانات للتحليل
  relations: Relation[];        // العلاقات بينها
  analysis_type: AnalysisType[];
  filters?: {
    min_connections?: number;
    relation_types?: string[];
    time_range?: [number, number];
  };
}

type AnalysisType = 
  | "centrality"      // مراكز الثقل
  | "communities"     // المجتمعات
  | "paths"           // المسارات
  | "clusters"        // التجمعات
  | "influence"       // التأثير
  | "bridges";        // الجسور
```

### المخرجات (Outputs)
```typescript
interface NetworkAnalyzerOutput {
  summary: NetworkSummary;
  centrality?: CentralityResult;
  communities?: Community[];
  key_paths?: Path[];
  insights: Insight[];
  visualization_data: VisualizationData;
}

interface NetworkSummary {
  total_nodes: number;
  total_edges: number;
  density: number;
  avg_degree: number;
  diameter: number;
}

interface CentralityResult {
  by_degree: RankedEntity[];
  by_betweenness: RankedEntity[];
  by_pagerank: RankedEntity[];
}

interface Community {
  id: string;
  name: string;
  members: Entity[];
  cohesion: number;
  main_theme: string;
}

interface Insight {
  type: "hub" | "bridge" | "outlier" | "cluster" | "trend";
  description_ar: string;
  entities: string[];
  significance: number;
}
```

### خوارزمية العمل
```
1. بناء الرسم البياني (Graph Construction)
   ├── تحويل الكيانات إلى عقد
   ├── تحويل العلاقات إلى أضلاع
   └── إضافة الأوزان

2. تحليل المركزية (Centrality Analysis)
   ├── Degree Centrality
   ├── Betweenness Centrality
   └── PageRank

3. اكتشاف المجتمعات (Community Detection)
   ├── Louvain Algorithm
   └── تسمية المجتمعات

4. تحليل المسارات (Path Analysis)
   ├── أقصر المسارات
   └── المسارات المهمة

5. استخراج الرؤى (Insights Extraction)
   ├── تحديد المحاور (hubs)
   ├── تحديد الجسور (bridges)
   └── تحديد الشاذ (outliers)

6. تحضير بيانات التصوير
   └── إحداثيات للعرض المرئي
```

---

## ═══════════════════════════════════════════════════════════════
## 💡 بوابة افهم (1 وكيل - دمج)
## ═══════════════════════════════════════════════════════════════

---

## 6️⃣ ClaimValidator (مصدّق الادعاءات) - دمج

### المعلومات الأساسية
```yaml
id: claim_validator
name: ClaimValidatorAgent
name_ar: مصدّق الادعاءات
gate: understand
category: analyze
cost: 0.04
time_seconds: 10
priority: HIGH
merged_from:
  - ConfidenceAnalyzer
  - ConsistencyChecker
```

### الغرض
تحليل قوة الادعاء من حيث الثقة وفحص اتساقه مع الادعاءات الأخرى (دمج وظيفتين).

### المدخلات (Inputs)
```typescript
interface ClaimValidatorInput {
  claim: Claim;
  validation_type: "confidence" | "consistency" | "full";
  related_claims?: Claim[];     // للفحص التناقضي
  evidence_sources?: string[];  // مصادر الأدلة
}

interface Claim {
  id?: string;
  content: string;
  scope?: {
    time?: string;
    place?: string;
    domain?: string;
    madhab?: string;
  };
  evidences?: Evidence[];
}
```

### المخرجات (Outputs)
```typescript
interface ClaimValidatorOutput {
  // تحليل الثقة
  confidence: {
    score: number;           // 0-1
    level: "weak" | "moderate" | "strong" | "very_strong";
    factors: ConfidenceFactor[];
  };
  
  // فحص الاتساق
  consistency: {
    is_consistent: boolean;
    contradictions: Contradiction[];
    agreements: Agreement[];
  };
  
  // التوصيات
  recommendations: string[];
  
  // الملخص
  summary_ar: string;
}

interface ConfidenceFactor {
  factor: string;
  impact: "positive" | "negative";
  weight: number;
  explanation: string;
}

interface Contradiction {
  claim_id: string;
  claim_content: string;
  contradiction_type: "direct" | "partial" | "contextual";
  severity: "low" | "medium" | "high";
  explanation: string;
}
```

### خوارزمية العمل
```
1. تحليل الثقة (Confidence Analysis)
   ├── فحص قوة الأدلة
   │   ├── عدد الأدلة
   │   ├── تنوع المصادر
   │   └── موثوقية المصادر
   ├── فحص وضوح النطاق
   │   ├── هل النطاق محدد؟
   │   └── هل هناك استثناءات؟
   ├── فحص الصياغة
   │   ├── هل الادعاء قابل للاختبار؟
   │   └── هل يحتوي مصطلحات غامضة؟
   └── حساب النتيجة النهائية

2. فحص الاتساق (Consistency Check)
   ├── مقارنة مع الادعاءات المرتبطة
   │   ├── البحث عن تناقضات مباشرة
   │   ├── البحث عن تناقضات جزئية
   │   └── البحث عن توافقات
   ├── تحليل السياق
   │   └── هل التناقض حقيقي أم ظاهري؟
   └── تصنيف حدة التناقض

3. توليد التوصيات
   ├── كيف تقوي الادعاء؟
   ├── ما الأدلة المفقودة؟
   └── كيف تحل التناقضات؟
```

---

## ═══════════════════════════════════════════════════════════════
## 📝 بوابة أنتج (3 وكلاء)
## ═══════════════════════════════════════════════════════════════

---

## 7️⃣ EvidenceWriter (كاتب الأدلة)

### المعلومات الأساسية
```yaml
id: evidence_writer
name: EvidenceWriterAgent
name_ar: كاتب الأدلة
gate: produce
category: produce
cost: 0.04
time_seconds: 10
priority: MEDIUM
```

### الغرض
كتابة فقرة أو نص موثق بروابط للأدلة والمصادر.

### المدخلات (Inputs)
```typescript
interface EvidenceWriterInput {
  topic: string;                    // الموضوع
  evidences: Evidence[];            // الأدلة المتاحة
  style: "academic" | "simple" | "detailed";
  length: "short" | "medium" | "long";
  citation_style: "inline" | "footnote" | "endnote";
  language: "ar" | "en";
}
```

### المخرجات (Outputs)
```typescript
interface EvidenceWriterOutput {
  text: string;                     // النص المكتوب
  text_with_citations: string;      // النص مع الاستشهادات
  citations: Citation[];
  word_count: number;
  evidences_used: string[];         // IDs الأدلة المستخدمة
}
```

---

## 8️⃣ OutlineBuilder (باني المخطط)

### المعلومات الأساسية
```yaml
id: outline_builder
name: OutlineBuilderAgent
name_ar: باني المخطط
gate: produce
category: produce
cost: 0.03
time_seconds: 8
priority: MEDIUM
```

### الغرض
تحويل أفكار أو ملاحظات متفرقة إلى مخطط منظم (فصول، أبواب، مباحث).

### المدخلات (Inputs)
```typescript
interface OutlineBuilderInput {
  title: string;
  ideas: string[];              // قائمة الأفكار
  notes?: string;               // ملاحظات إضافية
  structure_type: "book" | "paper" | "report" | "article";
  depth: 1 | 2 | 3;            // عمق التفرع
  include_introduction: boolean;
  include_conclusion: boolean;
}
```

### المخرجات (Outputs)
```typescript
interface OutlineBuilderOutput {
  outline: OutlineNode[];
  summary: string;
  estimated_pages: number;
  suggestions: string[];
}

interface OutlineNode {
  id: string;
  level: number;              // 1=فصل، 2=مبحث، 3=مطلب
  title: string;
  description?: string;
  children?: OutlineNode[];
  related_ideas: string[];    // الأفكار المدخلة المرتبطة
}
```

---

## 9️⃣ QualityChecker (فاحص الجودة) - دمج

### المعلومات الأساسية
```yaml
id: quality_checker
name: QualityCheckerAgent
name_ar: فاحص الجودة
gate: produce
category: produce
cost: 0.03
time_seconds: 8
priority: LOW
merged_from:
  - StyleEditor
  - CitationAuditor
```

### الغرض
فحص شامل لجودة النص من حيث الاتساق الأسلوبي واكتمال التوثيق.

### المدخلات (Inputs)
```typescript
interface QualityCheckerInput {
  text: string;
  check_types: ("style" | "citations" | "grammar" | "consistency")[];
  style_guide?: string;
  expected_citations?: number;
}
```

### المخرجات (Outputs)
```typescript
interface QualityCheckerOutput {
  overall_score: number;        // 0-100
  style_report?: StyleReport;
  citation_report?: CitationReport;
  grammar_report?: GrammarReport;
  consistency_report?: ConsistencyReport;
}
```

---

## ═══════════════════════════════════════════════════════════════
## ⚙️ بوابة أدِر (3 وكلاء)
## ═══════════════════════════════════════════════════════════════

---

## 🔟 QueryTuner (محسّن الاستعلام)

### المعلومات الأساسية
```yaml
id: query_tuner
name: QueryTunerAgent
name_ar: محسّن الاستعلام
gate: manage
category: manage
cost: 0.0
time_seconds: 2
priority: LOW
```

### الغرض
تحليل الاستعلام وتقديم اقتراحات لتحسين الكفاءة وتقليل التكلفة.

### المدخلات (Inputs)
```typescript
interface QueryTunerInput {
  query: string;
  current_settings: {
    agents_enabled: string[];
    expansion_level?: string;
    search_scope?: string[];
  };
  cost_budget?: number;
  time_budget?: number;
}
```

### المخرجات (Outputs)
```typescript
interface QueryTunerOutput {
  current_estimate: { cost: number; time_seconds: number; };
  optimized_settings: { agents_enabled: string[]; expansion_level: string; };
  optimized_estimate: { cost: number; time_seconds: number; savings_percent: number; };
  suggestions: TuningSuggestion[];
}
```

---

## 1️⃣1️⃣ TrainingCompanion (رفيق التدريب)

### المعلومات الأساسية
```yaml
id: training_companion
name: TrainingCompanionAgent
name_ar: رفيق التدريب
gate: manage
category: manage
cost: 0.0
time_seconds: 0
priority: LOW
```

### الغرض
تقديم مهام تعليمية تفاعلية لتدريب المستخدم على استخدام النظام.

### المدخلات (Inputs)
```typescript
interface TrainingCompanionInput {
  user_level: "beginner" | "intermediate" | "advanced";
  topic?: string;
  completed_tasks?: string[];
  request_type: "next_task" | "hint" | "explanation" | "progress";
}
```

### المخرجات (Outputs)
```typescript
interface TrainingCompanionOutput {
  task?: TrainingTask;
  hint?: string;
  explanation?: string;
  progress?: { completed: number; total: number; level: string; badges: string[]; };
}
```

---

## 1️⃣2️⃣ SystemHealth (صحة النظام) - دمج

### المعلومات الأساسية
```yaml
id: system_health
name: SystemHealthAgent
name_ar: صحة النظام
gate: manage
category: manage
cost: 0.0
time_seconds: 5
priority: MEDIUM
merged_from:
  - JobMonitor
  - DriftMonitor
  - AuditAgent
```

### الغرض
مراقبة شاملة لصحة النظام: الوظائف، الأداء، الجودة.

### المدخلات (Inputs)
```typescript
interface SystemHealthInput {
  check_type: "jobs" | "performance" | "quality" | "all";
  time_range?: { from: string; to: string; };
  agents_filter?: string[];
}
```

### المخرجات (Outputs)
```typescript
interface SystemHealthOutput {
  overall_health: "healthy" | "warning" | "critical";
  jobs_status?: JobsStatus;
  performance_status?: PerformanceStatus;
  quality_status?: QualityStatus;
  alerts: Alert[];
  recommendations: string[];
}
```

---

## 📊 ملخص المواصفات

### جدول سريع

| الوكيل | المدخل الرئيسي | المخرج الرئيسي | الأولوية |
|--------|---------------|----------------|----------|
| QueryExpander | query + language | expanded_queries[] | 🔴 |
| KnowledgeExplorer | starting_point + depth | exploration_tree[] | 🔴 |
| Suggester | context | suggestions[] | 🟡 |
| RelationProposer | source_entity | proposed_relations[] | 🔴 |
| NetworkAnalyzer | entities + relations | centrality + communities | 🔴 |
| ClaimValidator | claim | confidence + consistency | 🔴 |
| EvidenceWriter | topic + evidences | text_with_citations | 🟡 |
| OutlineBuilder | ideas[] | outline[] | 🟡 |
| QualityChecker | text | score + reports | 🟢 |
| QueryTuner | query + settings | optimized_settings | 🟢 |
| TrainingCompanion | user_level | task + progress | 🟢 |
| SystemHealth | check_type | health_status + alerts | 🟡 |

### ترتيب البناء المقترح

```
المرحلة 1 - الأساسية (4 وكلاء):
├── QueryExpander
├── RelationProposer
├── ClaimValidator
└── NetworkAnalyzer

المرحلة 2 - الإنتاج (4 وكلاء):
├── EvidenceWriter
├── OutlineBuilder
├── KnowledgeExplorer
└── SystemHealth

المرحلة 3 - الدعم (4 وكلاء):
├── Suggester
├── QualityChecker
├── QueryTuner
└── TrainingCompanion
```

---

**تم بحمد الله** 🕌

*IQRA-12 Agent Specifications v2.0*
