# تقرير الحالة التفصيلي — IQRAA (حتى 2026-02-24)

STANDARD: Single Source of Truth
RATIONALE: توثيق شامل — مصدر حقيقة وحيد لحالة المشروع
CONFIDENCE: HIGH

---

## 1) الحالة التشغيلية (Backend)
- نقطة التشغيل الوحيدة: `backend/main_agents.py` ✅
- خدمة API تعمل عبر uvicorn على 0.0.0.0:8005 ✅
- يتم التشغيل عبر: `python -m uvicorn backend.main_agents:app --host 0.0.0.0 --port 8005`
- المسارات المتاحة (openapi.json):
  - /api/v1/iqraa/search
  - /api/v1/iqraa/research
  - /api/v1/iqraa/save
  - /api/v1/iqraa/term-history
  - /api/epistemic/search
  - /api/v1/analyze
  - /health
- اللوحة تتصل فعليًا عبر /api/iqraa/search ✅

---

## 2) التطهير في الباك‑إند

### ✅ توحيد التشغيل
- لا توجد نقاط تشغيل إضافية
- `main_agents.py` هو المصدر الوحيد

### ✅ ترحيل مركزي إلى GCS
- Bucket: `gs://iqraa-central-archive`
- تم نقل الملفات التالية إلى:
  `gs://iqraa-central-archive/backend/cancelled_utils/2026-02-22/`
  - agents_orchestrator.py
  - atomic_query_builder.py
  - data_access_layer.py
  - query_router.py
  - response_formatter.py
  - agents/governance/cost_guardian.py
  - lib/quality_gate.py
  - lib/lineage.py
  - lib/rdf_exporter.py
- ✅ تمت إزالتها محليًا بالكامل

### ✅ الاستيرادات
- تم تحويل bq_memory إلى: `from backend.lib.bq_memory import ...`

---

## 3) البيانات (Entities)

### إزالة بيانات grand_launch_json المعطوبة
- تم عزل 77,864,328 صف إلى `entities_master_quarantine`
- ثم حذفها من `entities_master`
- بعد الحذف:
  - total = 130,680
  - null_type = 34,184 (26.16%)

---

## 4) حملات التوزيع (Unified Analysis)
- عدد الحملات: 3
- إجمالي الصفوف: 9006
- آخر تشغيل: 2026-02-21 17:53:39

تفاصيل:
- epistemic_production_v1 → 6540
- epistemic_pilot_v2 → 1506
- epistemic_cost_test → 960

---

## 5) البيئة التشغيلية
- تم إصلاح خطأ .bashrc (unexpected EOF)
- تمت إزالة المفتاح المكشوف

---

## 6) الفجوات الحالية
1) التشغيل يعتمد على PYTHONPATH — ✅ تم الحل (إزالة sys.path.insert)
2) وجود __main__ داخل ملفات أدوات — ✅ لا يوجد
3) نسبة NULL في gemini-2.0-flash (26.16%) — لم تُعالج
4) تم إصلاح حقن SQL (Query Parameters) + ضبط CORS + نقل إعدادات BigQuery للبيئة ✅

---

## 7) الحالة العامة
- صحة الباك‑إند: 78%
- الهدف القادم: 90% عبر سد الفجوات

---

## 8) ديون تقنية معلّقة
A) معالجة نسبة NULL في gemini-2.0-flash (26.16%) — تحتاج ضبط Prompt + إعادة تجارب
B) إضافة اختبارات تشغيلية للـ API (health + search) — تغطية أولية
C) تم إصلاح مخالفات WCAG الأساسية في واجهة البحث ✅

---

## 9) تحقق تشغيلي
- تم نجاح اختبار /api/v1/iqraa/search بترميز صحيح ✅
- تم نجاح /health ✅
- تم تحصين استعلام البحث الدلالي (Parameterized Query) ✅

---

## 10) تكامل الوكلاء
- تم تفعيل /api/v1/iqraa/ask وربطه بـ IQRAAEngine عبر Adapter ✅
- مسار /ask يعمل ويُرجع استجابة صحيحة ✅

---

## 11) تحديثات الواجهة
- تم تحديث Next.js إلى 16.1.6 ✅
- npm audit (prod) = 0 vulnerabilities ✅

---

## 12) توحيد استدعاء النماذج
- تم توحيد استدعاء LLM عبر backend/lib/llm_provider.py ✅
- تم تحصين استعلام RAG (Parameterized Query) ✅

### ديون تقنية
- /search موجودة فقط كتحويل Redirect إلى /research-assistant.
  يجب حذف المسار نهائيًا بعد استقرار تشغيل المحادثة بالكامل.

---

## 13) خط المعالجة -1 (Pipeline -1) — آخر تحديث: 2026-02-24

### البنية التحتية
- **GCS Bucket:** gs://iqraa-pipeline/ (us-central1)
  - raw/ → converted/ → cleaned/ → chunked/ → rejected/
  - manifests/ + backups/
- **الحجم الحالي:** ~50 GiB (مرحّل من gems_vault + مخازن قديمة)
- **النسخ الاحتياطي:** gs://iqraa-12-raw-library/backups/gems_vault (1.3GB)

### جداول Lineage (BigQuery — diwan_iqraa_v2)
- `pipeline_runs` — 16 حقل (metadata JSON) — تتبع كل تشغيل
- `chunk_lineage` — 13 حقل (quality_flags REPEATED) — تتبع كل قطعة
- ⚠️ الكتابة لم تُختبر live بعد (write_bq=True)

### كود خط المعالجة (ingestion/pipeline/)
- `converter_registry.py` — 12 صيغة + OpenITI (DEC-P1-005)
- `openiti_converter.py` — محوّل mARkdown (DEC-P1-014)
- `arabic_cleaner.py` — Quick+Deep، deep معطّل (camel_tools غير متاح) (DEC-P1-006)
- `chunker.py` — 300 كلمة + تداخل 30 (DEC-P1-007)
- `quality_gate.py` — 4 معايير (DEC-P1-008)
- `storage.py` — LocalStorage + GCSStorage abstraction (DEC-P1-011)
- `orchestrator.py` — v2: GCS I/O + Manifest + BQ Lineage + dependency injection (DEC-P1-017)

### التشغيل التجريبي (الوحدة 3)
- **المدخل:** 7 PDF من raw/other/global_library/
- **النتيجة:** 1 نجاح (حضارة العرب — 812K حرف، 618 قطعة، q=1.00) | 6 رفض (5 ممسوح ضوئياً + 1 إنجليزي) | 0 أخطاء
- **Manifest:** يُكتب لكل تشغيل في manifests/{run_id}.json

### النطاق (DEC-P1-018 + DEC-P1-019)
- IQRAA = تراث إسلامي + تثاقف حضاري + سياسات تنموية
- كل حقل معرفي جديد = جدول مستقل في BigQuery

### القرارات المعتمدة
DEC-P1-001 → DEC-P1-019 (تفاصيل في 07_PIPELINE_1/01_DECISIONS_P1.md)

### المشكلات المفتوحة
- 🟡 BQ write لم يُختبر live
- 🟡 معظم PDFs ممسوحة ضوئياً — يحتاج OCR
- 🟡 Quality Gate يرفض الإنجليزي — يحتاج multi-language
- 🟡 camel_tools غير متاح — deep clean معطّل
- 🟡 warraq_api.py — sys.path.insert مخالف

### الحالة
- ✅ بنية GCS + Lineage tables
- ✅ كود المعالجة (7 وحدات على السيرفر)
- ✅ orchestrator v2 يعمل (561 سطر)
- ✅ تشغيل تجريبي ناجح
- ⏳ اختبار BQ write live
- ⏳ OCR للمستندات الممسوحة
- ⏳ Cloud Run Job للأتمتة
