# 🚪 التصميم التفصيلي - وكيل بوابة النشر
## Publish Gate Checker Agent - Detailed Design Specification

**معرّف الوكيل:** GOV-002  
**الإصدار:** 1.0  
**التاريخ:** 21 ديسمبر 2025  
**الحالة:** جاهز للتنفيذ  

---

## 📋 البطاقة التعريفية

```yaml
Agent_ID: GOV-002
Name: Publish Gate Checker
Name_AR: وكيل فاحص بوابة النشر
Category: Governance (الحوكمة)
Autonomy_Level: L2 (تنفيذ بإشراف)
Risk_Tier: R3 (عالي)
Status: 🔴 غير منفذ
Priority: P0 (حرج)
```

---

## 🎯 المهمة (Mission)

> **بوابة جودة إلزامية قبل النشر الداخلي**
> 
> **لا نشر بدون اجتياز جميع الفحوصات**

### الأهداف المحددة

1. **ضمان الأدلة**: كل ادعاء مدعوم بدليل موثق
2. **ضمان الاستشهادات**: كل اقتباس له مصدر
3. **ضمان سلسلة الأصل**: التتبع الكامل من المصدر للمخرج
4. **ضمان قابلية التكرار**: إعادة إنتاج النتيجة ممكنة
5. **ضمان الحقوق**: صلاحية الاستخدام واضحة
6. **ضمان المراجعة**: عين بشرية فحصت المحتوى

---

## 🔌 واجهة البرمجة (API Contract)

### المدخلات (Inputs)

```typescript
interface PublishGateInput {
  // الأصل المراد نشره
  asset: {
    asset_id: string;
    asset_type: 'CLAIM' | 'REPORT' | 'ANALYSIS' | 'BUNDLE' | 'ARTICLE';
    title: string;
    content: string;
    created_by: string;
    created_at: string;
  };
  
  // بيانات الأدلة المرتبطة
  evidence?: {
    bundle_ids: string[];
    claims: Array<{
      claim_id: string;
      claim_text: string;
      evidence_ids: string[];
    }>;
  };
  
  // بيانات الاستشهادات
  citations?: Array<{
    citation_id: string;
    quote_text: string;
    source_id: string;
    page_number?: string;
  }>;
  
  // سلسلة الأصل
  provenance?: {
    chain: Array<{
      step: number;
      agent_id: string;
      action: string;
      timestamp: string;
      input_ids: string[];
      output_ids: string[];
    }>;
  };
  
  // المراجعة البشرية
  human_review?: {
    reviewer_id: string;
    reviewed_at: string;
    status: 'APPROVED' | 'REJECTED' | 'NEEDS_CHANGES';
    comments?: string;
  };
  
  // نوع النشر المطلوب
  publish_target: 'INTERNAL' | 'EXTERNAL' | 'DRAFT';
  
  // خيارات
  options?: {
    strict_mode: boolean;      // رفض عند أي فشل
    auto_fix: boolean;         // محاولة إصلاح تلقائي
    skip_checks?: string[];    // تخطي فحوصات معينة (للتطوير فقط)
  };
}
```

### المخرجات (Outputs)

```typescript
interface PublishGateOutput {
  // النتيجة العامة
  result: {
    passed: boolean;
    gate_id: string;
    timestamp: string;
    verdict: 'PUBLISH' | 'REJECT' | 'NEEDS_FIXES' | 'NEEDS_REVIEW';
  };
  
  // تفاصيل الفحوصات
  checklist: {
    evidence_check: CheckResult;
    citation_check: CheckResult;
    provenance_check: CheckResult;
    reproducibility_check: CheckResult;
    rights_check: CheckResult;
    human_review_check: CheckResult;
  };
  
  // ملخص
  summary: {
    total_checks: number;
    passed_checks: number;
    failed_checks: number;
    warnings: number;
    score: number;  // 0-100
  };
  
  // الإخفاقات
  failures: Array<{
    check_name: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    affected_items: string[];
    suggested_fix: string;
  }>;
  
  // الاقتراحات
  suggestions: Array<{
    type: 'FIX' | 'IMPROVEMENT' | 'WARNING';
    message: string;
    action_required: boolean;
  }>;
  
  // التوثيق
  audit: {
    gate_result_id: string;
    logged_at: string;
    decision_log_id: string;
  };
}

interface CheckResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP';
  score: number;           // 0-100
  items_checked: number;
  items_passed: number;
  items_failed: number;
  details: string[];
  timestamp: string;
}
```

---

## ✅ قائمة الفحوصات التفصيلية

### 1. فحص الأدلة (Evidence Check)

```yaml
الاسم: EVIDENCE_CHECK
الهدف: التحقق من أن كل ادعاء مدعوم بأدلة

المعايير:
  - كل claim له evidence_ids غير فارغة
  - كل evidence_id يشير لسجل موجود
  - نسبة ثقة الدليل >= 0.70
  - الدليل له passage_id صالح
  - السياق (context) متوفر

خوارزمية_الفحص:
  ```python
  def check_evidence(asset, evidence):
      results = []
      
      for claim in evidence.claims:
          # فحص 1: وجود أدلة
          if not claim.evidence_ids:
              results.append(Failure(
                  item=claim.claim_id,
                  reason='No evidence linked',
                  severity='CRITICAL'
              ))
              continue
          
          for eid in claim.evidence_ids:
              # فحص 2: الدليل موجود
              ev = get_evidence(eid)
              if not ev:
                  results.append(Failure(
                      item=eid,
                      reason='Evidence not found',
                      severity='CRITICAL'
                  ))
                  continue
              
              # فحص 3: نسبة الثقة
              if ev.confidence < 0.70:
                  results.append(Warning(
                      item=eid,
                      reason=f'Low confidence: {ev.confidence}',
                      severity='MEDIUM'
                  ))
              
              # فحص 4: المقطع الأصلي
              if not ev.passage_id or not passage_exists(ev.passage_id):
                  results.append(Failure(
                      item=eid,
                      reason='Source passage not found',
                      severity='HIGH'
                  ))
      
      return EvidenceCheckResult(results)
  ```

درجة_النجاح: 100% من الادعاءات لها أدلة صالحة
```

### 2. فحص الاستشهادات (Citation Check)

```yaml
الاسم: CITATION_CHECK
الهدف: التحقق من توثيق جميع الاقتباسات

المعايير:
  - كل quote له source_id
  - المصدر له metadata كاملة (عنوان، مؤلف، تاريخ)
  - الاقتباس موجود فعلاً في المصدر (إن أمكن التحقق)
  - لا اقتباسات يتيمة (orphan quotes)

خوارزمية_الفحص:
  ```python
  def check_citations(asset, citations):
      results = []
      
      # استخراج الاقتباسات من المحتوى
      quotes_in_content = extract_quotes(asset.content)
      cited_quotes = {c.quote_text for c in citations}
      
      # فحص 1: اقتباسات بدون توثيق
      for quote in quotes_in_content:
          if quote not in cited_quotes:
              results.append(Failure(
                  item=quote[:50],
                  reason='Quote without citation',
                  severity='HIGH'
              ))
      
      # فحص 2: صحة المصادر
      for citation in citations:
          source = get_source(citation.source_id)
          
          if not source:
              results.append(Failure(
                  item=citation.citation_id,
                  reason='Source not found',
                  severity='CRITICAL'
              ))
              continue
          
          # فحص metadata
          missing_fields = check_source_metadata(source)
          if missing_fields:
              results.append(Warning(
                  item=citation.citation_id,
                  reason=f'Missing: {missing_fields}',
                  severity='MEDIUM'
              ))
      
      return CitationCheckResult(results)
  ```

درجة_النجاح: 100% من الاقتباسات موثقة
```

### 3. فحص سلسلة الأصل (Provenance Check)

```yaml
الاسم: PROVENANCE_CHECK
الهدف: التحقق من وجود سلسلة تتبع كاملة

المعايير:
  - السلسلة تبدأ من مصدر أصلي (raw source)
  - كل خطوة لها agent_id, action, timestamp
  - لا فجوات في السلسلة
  - المدخلات والمخرجات متطابقة بين الخطوات

خوارزمية_الفحص:
  ```python
  def check_provenance(asset, provenance):
      if not provenance or not provenance.chain:
          return ProvenanceCheckResult(
              status='FAIL',
              reason='No provenance chain'
          )
      
      chain = provenance.chain
      results = []
      
      # فحص 1: سلسلة متصلة
      for i in range(len(chain) - 1):
          current = chain[i]
          next_step = chain[i + 1]
          
          # المخرجات = المدخلات التالية
          if not set(current.output_ids).intersection(next_step.input_ids):
              results.append(Failure(
                  item=f'Step {i} -> {i+1}',
                  reason='Chain discontinuity',
                  severity='CRITICAL'
              ))
      
      # فحص 2: البداية من مصدر أصلي
      first_step = chain[0]
      if not is_raw_source(first_step.input_ids):
          results.append(Warning(
              item='Chain start',
              reason='Does not start from raw source',
              severity='MEDIUM'
          ))
      
      # فحص 3: كل خطوة كاملة
      for step in chain:
          missing = []
          if not step.agent_id: missing.append('agent_id')
          if not step.action: missing.append('action')
          if not step.timestamp: missing.append('timestamp')
          
          if missing:
              results.append(Failure(
                  item=f'Step {step.step}',
                  reason=f'Missing: {missing}',
                  severity='HIGH'
              ))
      
      return ProvenanceCheckResult(results)
  ```

درجة_النجاح: سلسلة كاملة ومتصلة بدون فجوات
```

### 4. فحص قابلية التكرار (Reproducibility Check)

```yaml
الاسم: REPRODUCIBILITY_CHECK
الهدف: التحقق من إمكانية إعادة إنتاج النتيجة

المعايير:
  - المعاملات (parameters) محفوظة
  - إصدار النماذج/الأدوات محفوظ
  - البيانات المُدخلة قابلة للوصول
  - الخوارزمية/العملية موثقة

خوارزمية_الفحص:
  ```python
  def check_reproducibility(asset, provenance):
      results = []
      
      for step in provenance.chain:
          # فحص 1: المعاملات محفوظة
          if not step.parameters:
              results.append(Warning(
                  item=f'Step {step.step}',
                  reason='No parameters saved',
                  severity='MEDIUM'
              ))
          
          # فحص 2: إصدار النموذج
          if step.model_used and not step.model_version:
              results.append(Warning(
                  item=f'Step {step.step}',
                  reason='Model version not recorded',
                  severity='LOW'
              ))
          
          # فحص 3: المدخلات قابلة للوصول
          for input_id in step.input_ids:
              if not is_accessible(input_id):
                  results.append(Failure(
                      item=input_id,
                      reason='Input no longer accessible',
                      severity='HIGH'
                  ))
      
      return ReproducibilityCheckResult(results)
  ```

درجة_النجاح: جميع المعلومات اللازمة للتكرار متوفرة
```

### 5. فحص الحقوق (Rights Check)

```yaml
الاسم: RIGHTS_CHECK
الهدف: التحقق من صلاحية استخدام المحتوى

المعايير:
  - المصدر له ترخيص واضح
  - الترخيص يسمح بنوع الاستخدام المطلوب
  - الإسناد (attribution) مضمّن إن مطلوب
  - لا انتهاك لحقوق النشر

خوارزمية_الفحص:
  ```python
  def check_rights(asset, citations):
      results = []
      
      for citation in citations:
          source = get_source(citation.source_id)
          
          # فحص 1: الترخيص موجود
          if not source.license:
              results.append(Warning(
                  item=citation.source_id,
                  reason='No license information',
                  severity='MEDIUM'
              ))
              continue
          
          # فحص 2: الترخيص يسمح بالاستخدام
          if not license_allows(source.license, asset.publish_target):
              results.append(Failure(
                  item=citation.source_id,
                  reason=f'License {source.license} does not allow {asset.publish_target}',
                  severity='CRITICAL'
              ))
          
          # فحص 3: الإسناد
          if requires_attribution(source.license):
              if not has_attribution(asset, source):
                  results.append(Failure(
                      item=citation.source_id,
                      reason='Attribution required but missing',
                      severity='HIGH'
                  ))
      
      return RightsCheckResult(results)
  ```

درجة_النجاح: جميع المصادر مرخصة للاستخدام المطلوب
```

### 6. فحص المراجعة البشرية (Human Review Check)

```yaml
الاسم: HUMAN_REVIEW_CHECK
الهدف: التحقق من إتمام المراجعة البشرية

المعايير:
  - المراجعة تمت
  - المراجع معتمد
  - النتيجة: موافقة
  - لم يمض وقت طويل منذ المراجعة

خوارزمية_الفحص:
  ```python
  def check_human_review(asset, human_review, publish_target):
      # فحص 1: وجود مراجعة
      if not human_review:
          if publish_target == 'EXTERNAL':
              return HumanReviewCheckResult(
                  status='FAIL',
                  reason='Human review required for external publish'
              )
          else:
              return HumanReviewCheckResult(
                  status='WARN',
                  reason='No human review (internal only)'
              )
      
      # فحص 2: المراجع معتمد
      reviewer = get_reviewer(human_review.reviewer_id)
      if not reviewer or not reviewer.is_authorized:
          return HumanReviewCheckResult(
              status='FAIL',
              reason='Reviewer not authorized'
          )
      
      # فحص 3: النتيجة
      if human_review.status != 'APPROVED':
          return HumanReviewCheckResult(
              status='FAIL',
              reason=f'Review status: {human_review.status}'
          )
      
      # فحص 4: الحداثة (أقل من 30 يوم)
      review_age = days_since(human_review.reviewed_at)
      if review_age > 30:
          return HumanReviewCheckResult(
              status='WARN',
              reason=f'Review is {review_age} days old'
          )
      
      return HumanReviewCheckResult(status='PASS')
  ```

درجة_النجاح: مراجعة بشرية معتمدة وحديثة
```

---

## 🗄️ جداول قاعدة البيانات

### جدول gate_results

```sql
CREATE TABLE IF NOT EXISTS `iqraa-12.operations.gate_results` (
  -- المعرفات
  gate_result_id STRING NOT NULL,
  asset_id STRING NOT NULL,
  asset_type STRING,
  
  -- النتيجة العامة
  passed BOOL,
  verdict STRING,           -- PUBLISH/REJECT/NEEDS_FIXES/NEEDS_REVIEW
  score INT64,              -- 0-100
  
  -- تفاصيل الفحوصات (JSON)
  checklist JSON,
  /*
  {
    "evidence_check": {"status": "PASS", "score": 100, ...},
    "citation_check": {"status": "PASS", "score": 95, ...},
    ...
  }
  */
  
  -- الملخص
  total_checks INT64,
  passed_checks INT64,
  failed_checks INT64,
  warnings INT64,
  
  -- الإخفاقات (JSON Array)
  failures JSON,
  
  -- السياق
  publish_target STRING,     -- INTERNAL/EXTERNAL/DRAFT
  requested_by STRING,
  
  -- التوقيتات
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  
  PRIMARY KEY (gate_result_id) NOT ENFORCED
)
PARTITION BY DATE(checked_at)
CLUSTER BY asset_type, verdict
OPTIONS (
  description = 'نتائج فحص بوابة النشر',
  labels = [('agent', 'publish-gate'), ('zone', 'operations')]
);
```

### جدول publish_log

```sql
CREATE TABLE IF NOT EXISTS `iqraa-12.operations.publish_log` (
  -- المعرفات
  publish_id STRING NOT NULL,
  asset_id STRING NOT NULL,
  gate_result_id STRING,
  
  -- تفاصيل النشر
  publish_target STRING,     -- INTERNAL/EXTERNAL
  published_at TIMESTAMP,
  published_by STRING,
  
  -- الحالة
  status STRING,             -- PUBLISHED/UNPUBLISHED/RETRACTED
  retracted_at TIMESTAMP,
  retracted_reason STRING,
  
  -- النسخة
  version INT64,
  previous_version_id STRING,
  
  -- التوقيتات
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  
  PRIMARY KEY (publish_id) NOT ENFORCED
);
```

### جدول review_requests

```sql
CREATE TABLE IF NOT EXISTS `iqraa-12.operations.review_requests` (
  request_id STRING NOT NULL,
  asset_id STRING NOT NULL,
  
  -- الطلب
  requested_by STRING,
  requested_at TIMESTAMP,
  priority STRING,           -- LOW/NORMAL/HIGH/URGENT
  
  -- المراجعة
  assigned_to STRING,
  assigned_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- النتيجة
  review_status STRING,      -- PENDING/IN_PROGRESS/APPROVED/REJECTED/NEEDS_CHANGES
  reviewer_comments STRING,
  
  -- الربط
  gate_result_id STRING,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  
  PRIMARY KEY (request_id) NOT ENFORCED
);
```

---

## 🔄 خوارزمية القرار الرئيسية

```python
def evaluate_for_publish(input: PublishGateInput) -> PublishGateOutput:
    """
    الخوارزمية الرئيسية لتقييم الأصل للنشر
    """
    
    results = {}
    failures = []
    
    # 1. فحص الأدلة
    results['evidence_check'] = check_evidence(input.asset, input.evidence)
    if results['evidence_check'].status == 'FAIL':
        failures.extend(results['evidence_check'].failures)
    
    # 2. فحص الاستشهادات
    results['citation_check'] = check_citations(input.asset, input.citations)
    if results['citation_check'].status == 'FAIL':
        failures.extend(results['citation_check'].failures)
    
    # 3. فحص سلسلة الأصل
    results['provenance_check'] = check_provenance(input.asset, input.provenance)
    if results['provenance_check'].status == 'FAIL':
        failures.extend(results['provenance_check'].failures)
    
    # 4. فحص قابلية التكرار
    results['reproducibility_check'] = check_reproducibility(input.asset, input.provenance)
    if results['reproducibility_check'].status == 'FAIL':
        failures.extend(results['reproducibility_check'].failures)
    
    # 5. فحص الحقوق
    results['rights_check'] = check_rights(input.asset, input.citations)
    if results['rights_check'].status == 'FAIL':
        failures.extend(results['rights_check'].failures)
    
    # 6. فحص المراجعة البشرية
    results['human_review_check'] = check_human_review(
        input.asset, 
        input.human_review,
        input.publish_target
    )
    if results['human_review_check'].status == 'FAIL':
        failures.extend(results['human_review_check'].failures)
    
    # 7. حساب النتيجة النهائية
    verdict = calculate_verdict(results, failures, input.options)
    score = calculate_score(results)
    
    # 8. تسجيل النتيجة
    gate_result = log_gate_result(input, results, verdict, score, failures)
    
    # 9. بناء المخرج
    return PublishGateOutput(
        result=GateResult(
            passed=(verdict == 'PUBLISH'),
            gate_id=gate_result.id,
            verdict=verdict
        ),
        checklist=results,
        summary=Summary(
            total_checks=6,
            passed_checks=count_passed(results),
            failed_checks=count_failed(results),
            warnings=count_warnings(results),
            score=score
        ),
        failures=failures,
        suggestions=generate_suggestions(results, failures)
    )


def calculate_verdict(results, failures, options):
    """
    تحديد الحكم النهائي
    """
    
    # فشل حرج = رفض فوري
    critical_failures = [f for f in failures if f.severity == 'CRITICAL']
    if critical_failures:
        return 'REJECT'
    
    # فشل عالي الخطورة
    high_failures = [f for f in failures if f.severity == 'HIGH']
    if high_failures and options.strict_mode:
        return 'REJECT'
    
    if high_failures:
        return 'NEEDS_FIXES'
    
    # تحذيرات فقط
    if any(r.status == 'WARN' for r in results.values()):
        return 'NEEDS_REVIEW'
    
    # كل شيء نجح
    return 'PUBLISH'
```

---

## 📡 التكامل مع الوكلاء الآخرين

### من يستدعي Publish Gate

```yaml
Report_Generator:
  - يستدعي قبل حفظ التقرير النهائي
  - يمرر: asset, evidence, citations, provenance

Academic_Writer:
  - يستدعي قبل نشر المقال
  - يمرر: asset, evidence, citations

Claim_Crafter:
  - يستدعي قبل نشر الادعاء
  - يمرر: asset, evidence

Evidence_Bundler:
  - يستدعي قبل اعتماد الحزمة
  - يمرر: asset, provenance
```

### البروتوكول الإلزامي

```python
async def publish_asset(asset: Asset) -> PublishResult:
    """
    كل محاولة نشر يجب أن تمر عبر البوابة
    """
    
    # 1. تجميع البيانات المطلوبة
    evidence = gather_evidence(asset)
    citations = gather_citations(asset)
    provenance = build_provenance_chain(asset)
    human_review = get_human_review(asset)
    
    # 2. استدعاء بوابة النشر
    gate_result = await publish_gate.evaluate({
        'asset': asset,
        'evidence': evidence,
        'citations': citations,
        'provenance': provenance,
        'human_review': human_review,
        'publish_target': 'INTERNAL'
    })
    
    # 3. التصرف حسب النتيجة
    if gate_result.verdict == 'PUBLISH':
        return await do_publish(asset, gate_result.gate_id)
    
    elif gate_result.verdict == 'NEEDS_FIXES':
        return PublishResult(
            status='BLOCKED',
            reason='Fixes required',
            fixes_needed=gate_result.failures
        )
    
    elif gate_result.verdict == 'NEEDS_REVIEW':
        # إنشاء طلب مراجعة
        await create_review_request(asset, gate_result)
        return PublishResult(
            status='PENDING_REVIEW',
            request_id=review_request.id
        )
    
    else:  # REJECT
        return PublishResult(
            status='REJECTED',
            reason=gate_result.failures[0].description
        )
```

---

## 📊 مؤشرات الأداء

### KPIs الرئيسية

| المؤشر | الهدف | التحذير | الحرج |
|--------|-------|---------|-------|
| معدل النجاح من أول مرة | > 80% | < 70% | < 50% |
| متوسط وقت الفحص | < 5s | > 10s | > 30s |
| نسبة CRITICAL failures | < 5% | > 10% | > 20% |
| نسبة الأصول المنشورة بدون مشاكل لاحقة | > 99% | < 98% | < 95% |

### تقارير دورية

```yaml
Daily_Report:
  - عدد الأصول المفحوصة
  - معدل النجاح
  - أكثر الإخفاقات شيوعاً
  - قائمة الانتظار للمراجعة

Weekly_Report:
  - اتجاه الجودة
  - تحليل الإخفاقات المتكررة
  - توصيات للتحسين

Monthly_Report:
  - مراجعة شاملة
  - مقارنة بالأشهر السابقة
  - تحديث الحدود إن لزم
```

---

## 🧪 اختبارات القبول

### Test Cases

```yaml
TC-001:
  الوصف: أصل كامل يجتاز جميع الفحوصات
  المدخل: asset + evidence + citations + provenance + human_review (كلها صالحة)
  المتوقع: verdict=PUBLISH, passed=true, score=100

TC-002:
  الوصف: ادعاء بدون دليل يُرفض
  المدخل: claim بدون evidence_ids
  المتوقع: verdict=REJECT, evidence_check.status=FAIL

TC-003:
  الوصف: اقتباس بدون مصدر يفشل
  المدخل: asset يحتوي quote بدون citation
  المتوقع: verdict=NEEDS_FIXES, citation_check.status=FAIL

TC-004:
  الوصف: سلسلة أصل مقطوعة تفشل
  المدخل: provenance بفجوة
  المتوقع: provenance_check.status=FAIL

TC-005:
  الوصف: مصدر بترخيص يمنع النشر الخارجي
  المدخل: publish_target=EXTERNAL + source.license='no-derivatives'
  المتوقع: rights_check.status=FAIL

TC-006:
  الوصف: نشر خارجي بدون مراجعة بشرية يُرفض
  المدخل: publish_target=EXTERNAL + human_review=null
  المتوقع: human_review_check.status=FAIL

TC-007:
  الوصف: تحذيرات فقط = يحتاج مراجعة
  المدخل: asset مع low confidence evidence
  المتوقع: verdict=NEEDS_REVIEW

TC-008:
  الوصف: الوضع الصارم يرفض عند أي فشل HIGH
  المدخل: options.strict_mode=true + HIGH failure
  المتوقع: verdict=REJECT
```

---

## 🛠️ متطلبات التنفيذ

### التبعيات

```yaml
Internal_Agents:
  - Evidence Bundler (للتحقق من الأدلة)
  - Citation Linker (للتحقق من الاستشهادات)
  - Provenance Tracker (لسلسلة الأصل)

Database:
  - operations.gate_results
  - operations.publish_log
  - operations.review_requests
  - evidence.evidence_bundles
  - evidence.claims

External:
  - نظام إدارة المستخدمين (للمراجعين)
  - نظام الإشعارات (للتنبيهات)
```

### التكوين

```yaml
# config/publish_gate.yaml

thresholds:
  min_evidence_confidence: 0.70
  max_review_age_days: 30
  
strict_mode:
  default: false
  for_external: true
  
checks:
  evidence_check:
    enabled: true
    weight: 25
  citation_check:
    enabled: true
    weight: 20
  provenance_check:
    enabled: true
    weight: 20
  reproducibility_check:
    enabled: true
    weight: 15
  rights_check:
    enabled: true
    weight: 10
  human_review_check:
    enabled: true
    weight: 10
    required_for: ['EXTERNAL']

notifications:
  on_reject: true
  on_needs_review: true
  channels: ['email']
```

---

## 📚 المراجع

1. **W3C PROV** (2013). *PROV-DM: The PROV Data Model*. W3C Recommendation.
2. **IEEE** (2017). *IEEE Standard for Software Quality Assurance Processes*.
3. **ISO 25010** (2011). *Systems and software Quality Requirements and Evaluation*.

---

## ✅ قائمة فحص الجاهزية

- [ ] إنشاء جداول قاعدة البيانات
- [ ] تنفيذ كل فحص من الفحوصات الستة
- [ ] تنفيذ خوارزمية القرار
- [ ] إعداد التكوين
- [ ] تنفيذ واجهة API
- [ ] كتابة الاختبارات
- [ ] دمج مع الوكلاء الآخرين
- [ ] إعداد نظام الإشعارات
- [ ] اختبار شامل
- [ ] توثيق للمستخدمين

---

**نهاية التصميم التفصيلي - Publish Gate Checker**

*الإصدار: 1.0*
*التاريخ: 21 ديسمبر 2025*
