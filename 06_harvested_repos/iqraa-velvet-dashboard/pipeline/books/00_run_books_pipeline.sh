#!/usr/bin/env bash
# 00_run_books_pipeline.sh
# تشغيل خط الكتب الكامل: GCS -> raw_landing -> curated_core -> diwan_iqraa_elmi

set -euo pipefail

PROJECT_ID="iqraa-12"

usage() {
  cat <<EOF_USAGE
طريقة الاستخدام:

  $0 DATE SOURCE_SYSTEM

حيث:
  DATE          : تاريخ الدفعة بصيغة YYYY-MM-DD (مثال: 2025-11-29)
  SOURCE_SYSTEM : اسم النظام أو المصدر (مثال: portal ، legacy_catalog ، publisher_api)

المثال:

  $0 2025-11-29 portal

هذا السكربت يقوم بالتالي:

  1) تحميل ملف master_books.parquet من:
       gs://iqraa-12-raw/books/date=DATE/source=SOURCE_SYSTEM/master_books.parquet
     إلى جدول:
       iqraa-12.raw_landing.books_flat   (عبر 02_load_landing_books.sh)

  2) تشغيل sp_normalize_books
       (03_run_transform_books.sh)

  3) تشغيل sp_dispatch_books
       (04_run_dispatch_books.sh)
EOF_USAGE
}

if [[ $# -ne 2 ]]; then
  echo "❌ عدد الوسائط غير صحيح."
  usage
  exit 1
fi

INGEST_DATE="$1"
SOURCE_SYSTEM="$2"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "============================================="
echo "🚀 تشغيل خط الكتب الكامل BOOKS_PIPELINE"
echo "تاريخ الدفعة : ${INGEST_DATE}"
echo "نظام المصدر : ${SOURCE_SYSTEM}"
echo "الوقت        : $(date -Iseconds)"
echo "المجلد       : ${ROOT_DIR}"
echo "============================================="
echo

# 1) تحميل من GCS إلى raw_landing.books_flat
echo "🔹 (1/3) تحميل من GCS إلى BigQuery (Landing)..."
"${ROOT_DIR}/02_load_landing_books.sh" "${INGEST_DATE}" "${SOURCE_SYSTEM}"
echo "✅ انتهت خطوة التحميل."
echo

# 2) تحويل إلى curated_core.books_normalized
echo "🔹 (2/3) تشغيل تحويل الكتب sp_normalize_books..."
"${ROOT_DIR}/03_run_transform_books.sh"
echo "✅ انتهت خطوة التحويل."
echo

# 3) توزيع إلى diwan_iqraa_elmi.bibliographic_entries
echo "🔹 (3/3) تشغيل توزيع الكتب sp_dispatch_books..."
"${ROOT_DIR}/04_run_dispatch_books.sh"
echo "✅ انتهت خطوة التوزيع."
echo

echo "🎉 اكتمل خط الكتب BOOKS_PIPELINE بنجاح في: $(date -Iseconds)"
