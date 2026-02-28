# فهرس النوهاو — منظومة وكلاء إقرأ نسخة 2
# KNOWHOW Index — IQRAA Agents v2

**التاريخ:** 2026-02-27 (الجلسة 5)
**الغرض:** تجميع كل المعرفة المستخلصة من الأجيال السابقة في مكان واحد

---

## المصادر المحصودة

| # | الملف | المصدر الأصلي | المحتوى |
|---|-------|---------------|---------|
| 01 | 01_OPERATIONS_INDEX.yaml | gen5_operations_contracts/00_INDEX.yaml | 44 عملية ذرية في 8 فئات |
| 02 | 02_AGENTS_SPECS.md | gen5_specs_docs/AGENTS_SPECS.md | مواصفات 12 وكيل |
| 03 | 03_AGENT_REGISTRY.md | gen5_specs_docs/AGENT_REGISTRY_IQRA12.md | سجل الوكلاء |
| 04 | 04_GOVERNANCE.md | gen5_specs_docs/GOVERNANCE_IQRA12.md | دستور الحوكمة |
| 05 | 05_OPERATIONS_CONTRACTS/ | gen5_operations_contracts/*.yaml | عقود العمليات التفصيلية |
| 06 | 06_GEN4_CORE_INDEX.md | gen4_clean_platform/core/ | فهرس كود الجيل الرابع |
| 07 | 07_STRATEGIC_GEMS.md | gems_deep_extract/strategic_analysis.md | الجواهر الاستراتيجية |
| 08 | 08_GEMS_REGISTRY.csv | gems_deep_extract/gems_registry.csv | سجل 140 جوهرة |
| 09 | 09_GEN5_DESIGN_DOCS_INDEX.md | gen5_design_docs/ | فهرس وثائق التصميم |
| 10 | 10_GEN4_ARCHITECTURE.md | gen4_clean_platform/ | البنية المعمارية gen4 |

## المبادئ غير القابلة للتفاوض (من 00_INDEX.yaml)
1. لا claim بلا evidence
2. لا evidence بلا offsets وسياق
3. لا تشغيل بلا run_id + recipe
4. لا ربط كيانات بلا Suggest→Approve
5. لا نشر بلا بوابات الثقة (V1+V2+V4)

## القواعد الذهبية (من 00_INDEX.yaml)
- Extract: كل مخرج يحمل offset
- Link: كل ربط = Suggest → Evidence → Approve
- Trace: كل تتبع = محطات + انتقالات + تحولات + فاعلون
- Analyze: كل تحليل = بنية + أدلة + حدود + بدائل
- Construct: كل بناء = مواد + منهج + مخرج + provenance
- Synthesize: كل تركيب = عناصر + بنية + سرد + توثيق
- Write: لا كتابة بدون (claim_id + evidence_ids + citations)
- Verify: لا نشر بدون V1 + V2 + V4 ناجحة
