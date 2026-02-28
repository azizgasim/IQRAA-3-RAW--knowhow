# IQRA-12 Agents - وكلاء إقرأ-12

## Implemented Agents - الوكلاء المنفذين (6)

### 1. SemanticSearchAgent - البحث الدلالي
- **Gate**: [[gate-discover]]
- **Status**: ✅ Implemented
- **Endpoint**: `POST /api/search`
- **Description**: البحث الدلالي في التراث الإسلامي

### 2. EntityExtractorAgent - مستخرج الكيانات
- **Gate**: [[gate-link]]
- **Status**: ✅ Implemented
- **Endpoint**: `POST /api/extract-entities`
- **Description**: استخراج الكيانات من النصوص

### 3. IdentityResolverAgent - محلل الهوية
- **Gate**: [[gate-link]]
- **Status**: ✅ Implemented
- **Description**: تحديد هوية الكيانات المكررة

### 4. ClaimCrafterAgent - صائغ الادعاءات
- **Gate**: [[gate-understand]]
- **Status**: ✅ Implemented
- **Description**: صياغة الادعاءات العلمية

### 5. CounterEvidenceSeekerAgent - باحث الدليل المضاد
- **Gate**: [[gate-understand]]
- **Status**: ✅ Implemented
- **Description**: البحث عن أدلة معارضة

### 6. CostGuardianAgent - حارس التكلفة
- **Gate**: [[gate-manage]]
- **Status**: ✅ Implemented
- **Endpoint**: `POST /api/cost/estimate`
- **Description**: مراقبة وتقدير التكاليف

---

## Missing Agents - الوكلاء المفقودين (17)

### High Priority - أولوية عالية

| Agent | Gate | Description |
|-------|------|-------------|
| QueryExpanderAgent | [[gate-discover]] | إضافة مرادفات للاستعلام |
| KnowledgeExplorerAgent | [[gate-discover]] | رحلة استكشافية في التراث |
| SuggesterAgent | [[gate-discover]] | اقتراحات ذكية |
| RelationProposerAgent | [[gate-link]] | اقتراح روابط بين الكيانات |
| NetworkAnalyzerAgent | [[gate-link]] | تحليل بنية العلاقات |
| CitationLinkerAgent | [[gate-link]] | تتبع سلسلة الإسناد |

### Medium Priority - أولوية متوسطة

| Agent | Gate | Description |
|-------|------|-------------|
| ConfidenceAnalyzerAgent | [[gate-understand]] | تقييم قوة الدليل |
| ConsistencyCheckerAgent | [[gate-understand]] | فحص التناقضات |
| EvidenceWriterAgent | [[gate-produce]] | كتابة فقرة موثقة |
| OutlineBuilderAgent | [[gate-produce]] | بناء هيكل الفصول |
| CitationAuditorAgent | [[gate-produce]] | فحص اكتمال المراجع |
| StyleEditorAgent | [[gate-produce]] | توحيد الأسلوب |

### Low Priority - أولوية منخفضة

| Agent | Gate | Description |
|-------|------|-------------|
| QueryTunerAgent | [[gate-manage]] | تقليل الكلفة والوقت |
| TrainingCompanionAgent | [[gate-manage]] | مهام تعليمية تفاعلية |
| JobMonitorAgent | [[gate-manage]] | تنبيه عند فشل الوظائف |
| DriftMonitorAgent | [[gate-manage]] | تتبع تغير الأداء |
| AuditAgent | [[gate-manage]] | فحص دوري للجودة |

---

## Extra Backend Agents - وكلاء إضافيين (13)

هذه الوكلاء موجودة في الباكاند لكن غير مربوطة بالمفاتيح:

| Agent | Suggestion |
|-------|------------|
| HadithVerifierAgent | وظيفة التحقق من الأحاديث |
| QuranCrossRefAgent | البحث القرآني |
| ScholarProfilerAgent | ملفات العلماء |
| TimelineBuilderAgent | الخطوط الزمنية |
| MadhhabComparerAgent | مقارنة المذاهب |
| SourceRankerAgent | ترتيب المصادر |
| TextSummarizerAgent | التلخيص السريع |
| QAAgent | سؤال وجواب |
| ChainOfNarratorsAgent | تحليل السند |
| ManhajAdvisorAgent | الاستشارة المنهجية |
| RecipeBuilderAgent | وصفات البحث |
| PublishGateChecker | فحص النشر |
| EvidenceBundlerAgent | تجميع الأدلة |

#agents #backend #iqra12
