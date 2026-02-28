# تذكير سياق اقرا-12 - الجلسة 8
# انت مساعدي الذكي كبير خبراء تصميم وانشاء مشاريع الرقميات الانسانية على Google Cloud.

## المشروع: اقرا-12 - مكتبة ذكية لفهرسة التراث الاسلامي وتحليله ابستمولوجيا
## السحابة: Google Cloud مشروع iqraa-12 - المخزن BigQuery
## السيرفر: VM user@iqraa
## iqraa-12 الجذر مقفل للقراءة فقط - iqraa-v3 قابل للكتابة

## حالة BigQuery:
- iqraa_academic_v2: 4 جداول
  - iqraa_epistemic_taxonomy 4878 صف
  - taxonomy_registry 194 صف
  - table_registry
  - golden_dataset
- diwan_iqraa_v2: فارغ

## حالة اثراء iqraa_epistemic_taxonomy:
- field_description: 100 بالمئة 4878 - مكتمل
- prompt_template: 100 بالمئة 194 عدسة - مكتمل
- controlled_vocabulary: 45 بالمئة 2216 من 4878 - Phase 3 PID 19196 يعمل
- ontology_mapping: 6 بالمئة 280 من 4878 - ينتظر اكتمال Phase 3

## السكربت: enrich_taxonomy.py
- المسار: ~/iqraa-12/iqraa-v3/bigquery/scripts/enrich_taxonomy.py
- الحجم: 476 سطر - 4 مراحل - MAX_TOKENS=2048 - BATCH_SIZE=5
- تحذير: لا تشغل Phase 3 وPhase 4 معا ابدا

## مكونات خط 1 المفحوصة في الجلسة 7:
- openiti_converter.py 301 سطر - يعتمد
- text_cleaner.py 191 سطر - الاساس المعتمد
- quality_gate.py 128 سطر - يعتمد
- orchestrator.py 615 سطر - يحتاج تحديث
- converter_registry.py 224 سطر - يعتمد
- storage.py 165 سطر - يعتمد
- chunker.py 103 سطر - يعتمد
- warraq_engine.py 936 سطر - محرك حصاد متقدم
- arabic_cleaner.py و openiti_cleaner.py - مكرران يهملان

## مكونات خط 2 تحتاج فحص في الجلسة 8:
- ~/iqraa-12/iqraa-v3/agents/iqraa-agents-v2-complete/ - 7 وكلاء و6 بوابات
- ~/iqraa-12/iqraa-v3/agents/v2_design/knowhow/11_loc2_working_agents/ - 25 ملف

## هيكل v2_build:
- ~/iqraa-12/iqraa-v3/pipeline2/v2_build/ مع components وagents وtests وconfig

## بيئة السيرفر:
- Python 3.12.3 - anthropic 0.84.0 - BQ 3.40.0 - OpenITI 0.1.6
- ANTHROPIC_API_KEY: صالح

## الجلسات السابقة:
- جلسة 1: https://claude.ai/chat/22f0752e-15a5-48db-90db-fac316bd565d
- جلسة 2: https://claude.ai/chat/cc4001e7-4f46-49a1-93c7-2c9a0858bcdd
- جلسة 3: https://claude.ai/chat/64f9aa85-74f0-4875-ac9a-4b8fc491f679
- جلسة 4: https://claude.ai/chat/37a91fc9-9a75-450f-8e90-7490362320b9
- جلسة 5: https://claude.ai/chat/b51f01ac-61a4-411b-96cd-1f049dd76d08
- جلسة 6: https://claude.ai/chat/4d20cb70-8e47-4054-b7f0-05bc08b2cac0
- جلسة 6.5: https://claude.ai/chat/338e0356-f2e5-44d3-b1d6-2d1989eeb97b
- جلسة 7: https://claude.ai/chat/CURRENT
- جلسة 8: الحالية

## المهام بالترتيب للجلسة 8:
1. فحص اكتمال Phase 3 جولة 2
2. تشغيل Phase 4 اذا اكتمل Phase 3
3. فحص iqraa-agents-v2-complete بالتفصيل - خط 2
4. فحص 11_loc2_working_agents خصوصا epistemic_builder وclaude_client
5. بدء بناء EpistemicAgent لخط 2

## التعليمات الملزمة:
- التزم باظهار نسبة استهلاك السياق في كل رد
- عند 85 بالمئة بادر بكتابة تذكير وافي واطلب الانتقال لمحادثة جديدة
- قبل نهاية كل جلسة اصدر تقرير الحالة المعمارية
- في كل رد: لخص رد السيرفر واكتب برقم متسلسل المهمة القادمة واسمها ووظيفتها وصيغة الامر القابل للنسخ والتنفيذ
