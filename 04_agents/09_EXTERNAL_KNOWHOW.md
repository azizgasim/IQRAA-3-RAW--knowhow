# سجل النوهاو — Pipeline v2
# التاريخ: 2026-02-27

## أ) نوهاو داخلي (على السيرفر)
| المعرّف | المصدر | المسار | الاستخدام |
|---------|--------|--------|-----------|
| KH-001 | OpenITI converters | gems_vault/full_modules/openiti_new_books/convert/ | محوّلات shamela,hindawi,eShia,noorlib,GRAR |
| KH-002 | OpenITI Arabic Helpers | gems_vault/code_snippets/openiti_arabic_helpers.py | تطبيع عربي 411 سطر |
| KH-003 | GenAI Enrichment GEM_136 | gems_vault/full_modules/ | pdf_helper + text_helper |
| KH-004 | TEI P5 Standards | gems_vault/full_modules/tei_p5_standards/ | تصدير أكاديمي |
| KH-005 | Perseus Treebank | gems_vault/full_modules/perseus_treebank/ | مرجع بنية corpus |
| KH-006 | Dataflow Template GEM_001 | gems_vault/ | Cloud Run Jobs reference |

## ب) نوهاو خارجي (GitHub)
| المعرّف | المشروع | الرابط | الاستخدام |
|---------|---------|--------|-----------|
| KH-101 | OpenITI Python Library | github.com/OpenITI/openiti | shamela/hindawi/TEI converters |
| KH-102 | GCP Document AI Samples | github.com/GoogleCloudPlatform/document-ai-samples | OCR pipeline + SQL over Docs |
| KH-103 | DH Toolkit | github.com/pacian/Digital-Humanities-Toolkit | أدوات DH مفتوحة |
| KH-104 | KITAB Project | kitab-project.org | text reuse + corpus metadata |

## ج) معايير وأفضل ممارسات
| المعرّف | المعيار | الملاحظة |
|---------|---------|----------|
| KH-201 | Document AI Enterprise OCR | أحدث من Vision API — quality scores + 200 لغة |
| KH-202 | VLM-based OCR (OlmOCR-2) | أفضل أداء على عربي — بديل مستقبلي |
| KH-203 | Dublin Core + FAIR | مطبق في western_culture_sources |
| KH-204 | OpenITI mARkdown | معيار ترميز النصوص الإسلامية |
| KH-205 | CTS URN Structure | نظام تعريف النصوص الكنسي |

## د) توصيات للاستخدام الفوري
1. دمج محوّلات OpenITI (shamela أولاً) من KH-001 في converter_registry
2. تقييم Document AI Enterprise OCR (KH-201) كبديل/ترقية لـ Vision API
3. استخدام OpenITI Python Library (KH-101) مباشرة عبر pip install
4. اعتماد CTS URN (KH-205) لنظام تعريف المصادر
