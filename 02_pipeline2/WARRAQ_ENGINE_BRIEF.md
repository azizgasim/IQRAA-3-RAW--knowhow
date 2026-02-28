# الوراق - تعريف مكون للمساعد المعماري لخط المعالجة 1
# التاريخ: 2026-02-27

## ما هو الوراق
محرك حصاد ذكي 936 سطر Python وظيفته جلب الكتب والمخطوطات من المكتبات الرقمية المفتوحة

## المسار
~/iqraa-12/ingestion/warraq/warraq_engine.py

## 5 مكتبات مدعومة
- المكتبة الوقفية waqfeya - 20 طلب بالدقيقة
- Internet Archive archive_org - 60 طلب بالدقيقة
- مكتبة الاسكندرية alexandria - 30 طلب بالدقيقة
- المكتبة الشاملة shamela - 30 طلب بالدقيقة
- Project Gutenberg gutenberg - 60 طلب بالدقيقة

## 6 ادوات داخلية
- RetryEngine: اعادة محاولة ذكية مع backoff
- MirrorFinder: بحث عن نسخ بديلة وfallback لـ Wayback Machine
- RateLimiter: تحكم thread-safe بمعدل الطلبات
- SessionManager: جلسات مستمرة مع retry strategy
- CaptchaHandler: يطلب تدخل المستخدم
- ProxySupport: دعم وكيل معطل افتراضيا

## 4 اوضاع عمل
- passive: محاولة واحدة
- resilient: اعادة محاولات ومirrors
- aggressive: كل الادوات يحتاج موافقة
- stealth: تاخير وتمويه

## نظام منع التكرار
- يفحص كل كتاب قبل التحميل
- وحدة deduplication.py غير موجودة فعليا تحتاج بناء

## واجهة API: 7 دوال جاهزة للربط بالواجهة
## التقييم: عالي الجودة OOP نظيف قابل للتوسيع
## موقعه: اول مكون في خط 1 قبل Storage
