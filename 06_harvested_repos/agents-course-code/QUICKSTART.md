# IQRA-12 Quick Start Guide
## دليل البدء السريع

---

## 1. المتطلبات

```bash
# Python 3.11+
python --version

# Google Cloud SDK
gcloud --version

# تسجيل الدخول
gcloud auth application-default login
```

## 2. التثبيت

```bash
# استنساخ المستودع
git clone https://github.com/Azizgasiim/agents-course-code.git
cd agents-course-code

# إنشاء بيئة افتراضية
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# تثبيت الحزم
pip install -e ".[dev]"
```

## 3. تشغيل الـ Migrations

```bash
# اختبار الاتصال أولاً
python scripts/test_connection.py

# تشغيل migrations
python scripts/run_migrations.py
```

## 4. هيكل المشروع

```
agents-course-code/
├── src/iqra12/
│   ├── core/                 # الفئات الأساسية
│   │   └── base.py          # BaseOperation
│   ├── models/              # Pydantic schemas
│   │   ├── enums.py
│   │   └── schemas.py
│   ├── infrastructure/      # البنية التحتية
│   │   ├── bigquery_client.py
│   │   └── config.py
│   └── operations/          # 44 عملية
│       ├── extract/         # E1-E6
│       ├── link/            # L1-L5
│       ├── trace/           # T1-T5
│       ├── analyze/         # A1-A6
│       ├── construct/       # C1-C6
│       ├── synthesize/      # S1-S5
│       ├── write/           # W1-W5
│       └── verify/          # V1-V6
├── sql/migrations/          # SQL migrations
├── scripts/                 # أدوات التشغيل
└── docs/                    # التوثيق
```

## 5. مثال الاستخدام

```python
import asyncio
from iqra12.operations.extract import E1_TextSearch
from iqra12.models.schemas import OperationInput, RunContext
from uuid import uuid4

async def main():
    # إنشاء سياق التشغيل
    context = RunContext(
        run_id=uuid4(),
        project_id="my-research-project",
        corpus_scope=["diwan"],
        cost_budget_usd=1.0,
    )
    
    # إنشاء المدخلات
    input_data = OperationInput(
        context=context,
        parameters={
            "query": "المقاصد الشرعية",
            "limit": 50,
        }
    )
    
    # تنفيذ البحث
    operation = E1_TextSearch()
    result = await operation.execute(input_data)
    
    if result.success:
        print(f"Found {result.result['total_found']} passages")
        for passage in result.result['passages'][:3]:
            print(f"  - {passage['passage_id']}: {passage['text'][:100]}...")
    else:
        print(f"Error: {result.error_message}")

asyncio.run(main())
```

## 6. الجداول في BigQuery

### iqra_unified
- `passages` - المقاطع الموحدة (VIEW)
- `passages_diwan` - مقاطع الديوان (MATERIALIZED)
- `source_registry` - سجل المصادر

### ops
- `runs` - سجل التشغيلات
- `recipes` - مكتبة الوصفات
- `agent_registry` - سجل الوكلاء
- `decision_log` - سجل القرارات

### evidence
- `bundles` - حزم الأدلة
- `items` - عناصر الأدلة
- `claims` - الادعاءات
- `counter_evidence` - الأدلة المضادة

## 7. القواعد الذهبية

| # | القاعدة | التطبيق |
|---|---------|---------|
| 1 | لا ادعاء بدون أدلة | claims.supporting_bundle_id NOT NULL |
| 2 | لا دليل بدون offsets | items.offset_start/end NOT NULL |
| 3 | لا دمج بدون V1, V2 | تشغيل عمليات التحقق |
| 4 | لا نشر بدون V4 | claims.v4_passed = TRUE |
| 5 | لا توسيع استقلالية | agent_registry.autonomy_level |

---

*IQRA-12 Team - 2025*
