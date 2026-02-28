# 💰 التصميم التفصيلي - وكيل حارس التكلفة
## Cost Guardian Agent - Detailed Design Specification

**معرّف الوكيل:** GOV-001  
**الإصدار:** 1.0  
**التاريخ:** 21 ديسمبر 2025  
**الحالة:** جاهز للتنفيذ  

---

## 📋 البطاقة التعريفية

```yaml
Agent_ID: GOV-001
Name: Cost Guardian Agent
Name_AR: وكيل حارس التكلفة
Category: Governance (الحوكمة)
Autonomy_Level: L3 (استقلالية مشروطة)
Risk_Tier: R2 (متوسط)
Status: 🔴 غير منفذ
Priority: P0 (حرج)
```

---

## 🎯 المهمة (Mission)

> **حماية المشروع من الإنفاق غير المنضبط على BigQuery**
> 
> مراقبة، تحذير، وإيقاف طارئ عند الحاجة

### الأهداف المحددة

1. **تقدير التكلفة** قبل تنفيذ أي استعلام
2. **منع الاستعلامات الباهظة** من التنفيذ بدون موافقة
3. **مراقبة الميزانية** وإرسال تنبيهات استباقية
4. **توثيق كل قرار** في سجل التكاليف
5. **إيقاف طارئ** عند تجاوز الحدود الحرجة

---

## 🔌 واجهة البرمجة (API Contract)

### المدخلات (Inputs)

```typescript
interface CostGuardianInput {
  // الاستعلام المراد فحصه
  query: {
    sql: string;              // نص SQL
    parameters?: Record<string, any>;  // المعاملات
    source_agent_id: string;  // الوكيل الطالب
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  };
  
  // سياق الميزانية
  budget_context: {
    project_daily_budget: number;    // الميزانية اليومية للمشروع ($)
    project_monthly_budget: number;  // الميزانية الشهرية ($)
    session_limit?: number;          // حد الجلسة ($)
    agent_quota?: number;            // حصة الوكيل ($)
  };
  
  // خيارات
  options?: {
    dry_run: boolean;         // تقدير فقط بدون تنفيذ
    skip_cache: boolean;      // تجاوز التخزين المؤقت
    force_approval: boolean;  // طلب موافقة حتى لو ضمن الحدود
  };
}
```

### المخرجات (Outputs)

```typescript
interface CostGuardianOutput {
  // نتيجة التقدير
  cost_estimate: {
    bytes_to_scan: number;        // البايتات المتوقع مسحها
    estimated_cost_usd: number;   // التكلفة المقدرة بالدولار
    cost_tier: 'FREE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
    confidence: number;           // نسبة الثقة في التقدير (0-1)
    calculation_method: string;   // طريقة الحساب
  };
  
  // القرار
  decision: {
    status: 'APPROVED' | 'WARNED' | 'BLOCKED' | 'ESCALATED';
    reason: string;
    suggested_alternatives?: string[];  // بدائل أقل تكلفة
  };
  
  // حالة الميزانية
  budget_status: {
    daily_consumed: number;       // المستهلك اليوم ($)
    daily_remaining: number;      // المتبقي اليوم ($)
    daily_percentage: number;     // النسبة المئوية المستهلكة
    monthly_consumed: number;     // المستهلك هذا الشهر ($)
    monthly_remaining: number;    // المتبقي هذا الشهر ($)
    alert_level: 'OK' | 'WARNING' | 'CRITICAL';
  };
  
  // التوثيق
  audit: {
    decision_id: string;
    timestamp: string;
    logged: boolean;
  };
}
```

---

## ⚙️ الإجراءات (Actions)

### 1. preview_cost
```yaml
الوصف: تقدير تكلفة الاستعلام بدون تنفيذه
المدخلات: sql, parameters
المخرجات: CostEstimate
الآثار_الجانبية: لا شيء
```

### 2. approve_query
```yaml
الوصف: الموافقة على تنفيذ الاستعلام
المدخلات: query_id, justification
المخرجات: ApprovalToken
الآثار_الجانبية: تسجيل في cost_logs
```

### 3. block_query
```yaml
الوصف: منع تنفيذ الاستعلام
المدخلات: query_id, reason
المخرجات: BlockRecord
الآثار_الجانبية: تسجيل في cost_logs + إشعار
```

### 4. circuit_breaker
```yaml
الوصف: إيقاف طارئ لجميع الاستعلامات
المدخلات: reason, duration_minutes
المخرجات: CircuitBreakerStatus
الآثار_الجانبية: إيقاف المنظومة + تنبيه فوري
```

### 5. get_budget_status
```yaml
الوصف: استعلام عن حالة الميزانية الحالية
المدخلات: scope (daily/monthly/session)
المخرجات: BudgetStatus
الآثار_الجانبية: لا شيء
```

### 6. set_quota
```yaml
الوصف: تعيين حصة لوكيل معين
المدخلات: agent_id, quota_usd, period
المخرجات: QuotaRecord
الآثار_الجانبية: تحديث agent_quotas
```

---

## 📊 حدود التكلفة (Cost Thresholds)

### جدول الحدود

| الفئة | الحد | القرار | الإجراء |
|-------|------|--------|---------|
| **FREE** | $0 | ✅ APPROVE | تنفيذ فوري |
| **LOW** | < $0.10 | ✅ APPROVE | تنفيذ + تسجيل |
| **MEDIUM** | $0.10 - $1.00 | ⚠️ WARN | تنفيذ + تحذير |
| **HIGH** | $1.00 - $10.00 | 🔶 REQUIRE_APPROVAL | انتظار موافقة |
| **EXTREME** | > $10.00 | 🔴 BLOCK | منع + تصعيد |

### حساب التكلفة

```python
def estimate_cost(bytes_scanned: int) -> float:
    """
    تسعير BigQuery: $5 لكل TB
    أول 1TB مجاني شهرياً (حساب Free Tier)
    """
    TB = 1024 ** 4  # 1 Terabyte in bytes
    PRICE_PER_TB = 5.0  # USD
    
    cost = (bytes_scanned / TB) * PRICE_PER_TB
    return round(cost, 4)

def get_cost_tier(cost: float) -> str:
    if cost == 0:
        return 'FREE'
    elif cost < 0.10:
        return 'LOW'
    elif cost < 1.00:
        return 'MEDIUM'
    elif cost < 10.00:
        return 'HIGH'
    else:
        return 'EXTREME'
```

---

## 🗄️ جداول قاعدة البيانات

### جدول cost_logs

```sql
CREATE TABLE IF NOT EXISTS `iqraa-12.operations.cost_logs` (
  -- المعرفات
  log_id STRING NOT NULL,
  decision_id STRING NOT NULL,
  
  -- الاستعلام
  query_hash STRING,           -- تجزئة SQL
  query_preview STRING,        -- أول 500 حرف من SQL
  source_agent_id STRING,      -- الوكيل الطالب
  
  -- التقدير
  bytes_estimated INT64,
  cost_estimated FLOAT64,
  cost_tier STRING,
  estimation_confidence FLOAT64,
  
  -- القرار
  decision_status STRING,      -- APPROVED/WARNED/BLOCKED/ESCALATED
  decision_reason STRING,
  
  -- التنفيذ الفعلي (بعد التنفيذ)
  bytes_actual INT64,
  cost_actual FLOAT64,
  execution_time_ms INT64,
  
  -- السياق
  daily_budget FLOAT64,
  daily_consumed_before FLOAT64,
  session_id STRING,
  
  -- التوقيتات
  requested_at TIMESTAMP,
  decided_at TIMESTAMP,
  executed_at TIMESTAMP,
  
  -- الميتاداتا
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  
  PRIMARY KEY (log_id) NOT ENFORCED
)
PARTITION BY DATE(created_at)
CLUSTER BY source_agent_id, decision_status
OPTIONS (
  description = 'سجل قرارات التكلفة',
  labels = [('agent', 'cost-guardian'), ('zone', 'operations')]
);
```

### جدول agent_quotas

```sql
CREATE TABLE IF NOT EXISTS `iqraa-12.operations.agent_quotas` (
  agent_id STRING NOT NULL,
  quota_daily FLOAT64,         -- الحصة اليومية ($)
  quota_monthly FLOAT64,       -- الحصة الشهرية ($)
  consumed_today FLOAT64,      -- المستهلك اليوم ($)
  consumed_month FLOAT64,      -- المستهلك الشهر ($)
  last_reset_daily TIMESTAMP,
  last_reset_monthly TIMESTAMP,
  is_active BOOL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  
  PRIMARY KEY (agent_id) NOT ENFORCED
);
```

### جدول circuit_breaker_log

```sql
CREATE TABLE IF NOT EXISTS `iqraa-12.operations.circuit_breaker_log` (
  event_id STRING NOT NULL,
  triggered_at TIMESTAMP,
  triggered_by STRING,         -- agent_id أو 'SYSTEM'
  reason STRING,
  duration_minutes INT64,
  resolved_at TIMESTAMP,
  resolved_by STRING,
  resolution_notes STRING,
  
  PRIMARY KEY (event_id) NOT ENFORCED
);
```

---

## 🔄 خوارزمية القرار (Decision Algorithm)

```python
def evaluate_query(input: CostGuardianInput) -> CostGuardianOutput:
    """
    الخوارزمية الرئيسية لتقييم الاستعلام
    """
    
    # 1. فحص Circuit Breaker
    if is_circuit_breaker_active():
        return block_with_reason("Circuit breaker active")
    
    # 2. تقدير التكلفة
    cost_estimate = estimate_query_cost(input.query.sql)
    
    # 3. فحص الميزانية
    budget = get_current_budget_status()
    
    # 4. فحص حصة الوكيل
    agent_quota = get_agent_quota(input.query.source_agent_id)
    
    # 5. اتخاذ القرار
    decision = make_decision(cost_estimate, budget, agent_quota)
    
    # 6. تسجيل القرار
    log_decision(input, cost_estimate, decision)
    
    # 7. إرجاع النتيجة
    return build_output(cost_estimate, decision, budget)


def make_decision(cost: CostEstimate, budget: Budget, quota: Quota) -> Decision:
    """
    شجرة القرار
    """
    
    # قاعدة 1: الميزانية اليومية
    if budget.daily_consumed + cost.estimated > budget.daily_limit:
        return Decision(
            status='BLOCKED',
            reason='Would exceed daily budget'
        )
    
    # قاعدة 2: حصة الوكيل
    if quota and quota.consumed_today + cost.estimated > quota.daily:
        return Decision(
            status='BLOCKED',
            reason=f'Agent quota exceeded for {quota.agent_id}'
        )
    
    # قاعدة 3: حدود التكلفة
    tier = cost.tier
    
    if tier == 'FREE':
        return Decision(status='APPROVED', reason='Zero cost query')
    
    elif tier == 'LOW':
        return Decision(status='APPROVED', reason='Within auto-approve threshold')
    
    elif tier == 'MEDIUM':
        return Decision(
            status='WARNED',
            reason=f'Cost ${cost.estimated:.2f} above warning threshold'
        )
    
    elif tier == 'HIGH':
        return Decision(
            status='ESCALATED',
            reason=f'Cost ${cost.estimated:.2f} requires approval'
        )
    
    else:  # EXTREME
        return Decision(
            status='BLOCKED',
            reason=f'Cost ${cost.estimated:.2f} exceeds maximum allowed'
        )
```

---

## 📡 التكامل مع الوكلاء الآخرين

### المعتمدون على Cost Guardian

```yaml
Search_Agents:
  - Semantic Search → يستدعي preview_cost قبل كل بحث
  - Keyword Search → يستدعي preview_cost قبل كل بحث
  
Extraction_Agents:
  - Entity Extractor → يستدعي preview_cost قبل مسح الجداول
  
Bundle_Agents:
  - Evidence Bundler → يستدعي preview_cost قبل تجميع الأدلة
  
Report_Agents:
  - Report Generator → يستدعي preview_cost قبل إنشاء التقارير
```

### البروتوكول الإلزامي

```python
# كل وكيل يستعلم BigQuery يجب أن:

async def execute_query(sql: str) -> QueryResult:
    # 1. طلب موافقة Cost Guardian
    approval = await cost_guardian.preview_cost(sql)
    
    # 2. فحص القرار
    if approval.decision.status == 'BLOCKED':
        raise CostBlockedException(approval.decision.reason)
    
    if approval.decision.status == 'ESCALATED':
        # انتظار موافقة بشرية أو إلغاء
        approval = await wait_for_human_approval(approval)
        if not approval.approved:
            raise CostApprovalDeniedException()
    
    # 3. تنفيذ مع التوكن
    result = await bigquery.execute(sql, approval_token=approval.token)
    
    # 4. إبلاغ Cost Guardian بالتكلفة الفعلية
    await cost_guardian.report_actual_cost(
        approval.token, 
        result.bytes_billed
    )
    
    return result
```

---

## 🚨 سيناريوهات الطوارئ

### سيناريو 1: تجاوز الميزانية اليومية

```yaml
المحفز: daily_consumed >= daily_budget
الإجراءات:
  1. تفعيل Circuit Breaker
  2. إرسال تنبيه فوري (email + slack)
  3. رفض جميع الاستعلامات الجديدة
  4. انتظار:
     أ) منتصف الليل (reset تلقائي)
     ب) أو زيادة الميزانية يدوياً
     ج) أو موافقة استثنائية من المدير
```

### سيناريو 2: استعلام مشبوه

```yaml
المحفز: 
  - استعلام يمسح > 50% من البيانات
  - استعلام بدون WHERE clause على جدول كبير
  - CROSS JOIN على جداول كبيرة

الإجراءات:
  1. حجب فوري (BLOCK)
  2. تسجيل الحادثة
  3. إشعار فريق الأمان
  4. اقتراح بدائل آمنة
```

### سيناريو 3: سلوك شاذ من وكيل

```yaml
المحفز:
  - وكيل واحد يستهلك > 50% من الميزانية
  - أكثر من 100 استعلام/دقيقة من وكيل واحد
  - نمط استعلامات متكررة (loop مشتبه)

الإجراءات:
  1. تعليق صلاحيات الوكيل مؤقتاً
  2. تسجيل الحادثة
  3. إشعار المطورين
  4. طلب مراجعة كود الوكيل
```

---

## 📊 لوحة المراقبة (Dashboard Metrics)

### المقاييس الحية

```yaml
Real-Time:
  - الميزانية المتبقية (يومي/شهري)
  - الاستعلامات/دقيقة
  - متوسط التكلفة/استعلام
  - حالة Circuit Breaker

Per-Agent:
  - استهلاك كل وكيل
  - معدل الرفض لكل وكيل
  - أغلى استعلام لكل وكيل

Historical:
  - تكلفة الأسبوع الماضي
  - اتجاه الاستهلاك
  - قائمة أغلى 10 استعلامات
```

### التنبيهات

| المستوى | الشرط | القناة |
|---------|-------|--------|
| 🟢 Info | استهلاك 50% | Log فقط |
| 🟡 Warning | استهلاك 80% | Email |
| 🟠 Alert | استهلاك 90% | Email + Slack |
| 🔴 Critical | استهلاك 100% | Email + Slack + SMS |

---

## 🧪 اختبارات القبول

### Test Cases

```yaml
TC-001:
  الوصف: استعلام مجاني يُقبل تلقائياً
  المدخل: SELECT 1
  المتوقع: status=APPROVED, tier=FREE

TC-002:
  الوصف: استعلام منخفض التكلفة يُقبل مع تسجيل
  المدخل: SELECT * FROM small_table LIMIT 100
  المتوقع: status=APPROVED, tier=LOW

TC-003:
  الوصف: استعلام متوسط يُقبل مع تحذير
  المدخل: SELECT * FROM medium_table
  المتوقع: status=WARNED, tier=MEDIUM

TC-004:
  الوصف: استعلام مكلف يُصعَّد للموافقة
  المدخل: SELECT * FROM passages (157M rows)
  المتوقع: status=ESCALATED, tier=HIGH

TC-005:
  الوصف: استعلام باهظ يُرفض تلقائياً
  المدخل: SELECT * FROM passages CROSS JOIN documents
  المتوقع: status=BLOCKED, tier=EXTREME

TC-006:
  الوصف: Circuit Breaker يعمل عند تجاوز الميزانية
  السياق: daily_consumed = 99%, incoming_cost = 5%
  المتوقع: BLOCKED + circuit_breaker_activated

TC-007:
  الوصف: الوكيل يُحجب عند تجاوز حصته
  السياق: agent_quota = $1, agent_consumed = $0.95, query_cost = $0.10
  المتوقع: status=BLOCKED, reason='Agent quota exceeded'
```

---

## 🛠️ متطلبات التنفيذ

### التبعيات

```yaml
Google_Cloud:
  - BigQuery API (لتقدير التكلفة)
  - BigQuery Storage API (للتنفيذ)
  - Cloud Monitoring (للمراقبة)
  - Cloud Alerting (للتنبيهات)

Internal:
  - operations.cost_logs (جدول)
  - operations.agent_quotas (جدول)
  - operations.circuit_breaker_log (جدول)
```

### التكوين

```yaml
# config/cost_guardian.yaml

thresholds:
  auto_approve_usd: 0.10
  warn_threshold_usd: 1.00
  require_approval_usd: 10.00
  block_threshold_usd: 100.00

budgets:
  daily_default_usd: 50.00
  monthly_default_usd: 500.00
  
circuit_breaker:
  trigger_at_budget_percent: 100
  auto_reset: false
  
alerts:
  warning_at_percent: 80
  critical_at_percent: 95
  channels: ['email', 'slack']
```

---

## 📚 المراجع

1. **Storment, J. & Reis, M.** (2023). *Cloud FinOps: Collaborative, Real-Time Cloud Financial Management*. O'Reilly Media.
2. **Google Cloud** (2024). *BigQuery Pricing Documentation*.
3. **Fowler, M.** (2014). *Circuit Breaker Pattern*. martinfowler.com.

---

## ✅ قائمة فحص الجاهزية

- [ ] إنشاء جداول قاعدة البيانات
- [ ] تنفيذ الواجهة الأساسية
- [ ] تنفيذ خوارزمية التقدير
- [ ] تنفيذ Circuit Breaker
- [ ] إعداد التنبيهات
- [ ] كتابة الاختبارات
- [ ] توثيق API
- [ ] دمج مع الوكلاء الآخرين
- [ ] اختبار في بيئة التطوير
- [ ] نشر في بيئة الإنتاج

---

**نهاية التصميم التفصيلي - Cost Guardian Agent**

*الإصدار: 1.0*
*التاريخ: 21 ديسمبر 2025*
