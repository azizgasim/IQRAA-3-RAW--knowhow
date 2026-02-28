#!/usr/bin/env bash
# 02_load_landing_books.sh
# تحميل ملف master_books.parquet من GCS إلى جدول BigQuery: raw_landing.books_flat

set -euo pipefail

#############################################
# الإعدادات العامة
#############################################

PROJECT_ID="iqraa-12"

# اسم البكت الخام
GCS_BUCKET="iqraa-12-raw"

# نوع الكيان (كتب)
ENTITY_TYPE="books"

# Dataset وجداول BigQuery
BQ_DATASET="raw_landing"
BQ_TABLE="books_flat"

#############################################
# طريقة الاستخدام
#############################################

usage() {
  cat <<EOF_USAGE
طريقة الاستخدام:

  $0 DATE SOURCE_SYSTEM

حيث:
  DATE          : تاريخ الدفعة بصيغة YYYY-MM-DD (مثال: 2025-11-29)
  SOURCE_SYSTEM : اسم النظام أو المصدر (مثال: portal ، legacy_catalog ، publisher_api)

المثال:

  $0 2025-11-29 portal

سيقرأ من:

  gs://${GCS_BUCKET}/${ENTITY_TYPE}/date=2025-11-29/source=portal/master_books.parquet

وسيحمّل إلى الجدول:

  ${PROJECT_ID}.${BQ_DATASET}.${BQ_TABLE}

ملاحظات:
- يُفترض أن الملف موجود في GCS (تم رفعه بواسطة 01_upload_master_file.sh).
- يُفضّل أن يكون الجدول ${BQ_DATASET}.${BQ_TABLE} منشأ مسبقًا مع إعدادات
  الـPartitioning والـClustering، لكن السكربت سيعمل أيضًا لو تركت BigQuery
  يُنشئ الجدول تلقائيًا عبر --autodetect.
EOF_USAGE
}

#############################################
# التحقق من الوسائط
#############################################

if [[ $# -ne 2 ]]; then
  echo "❌ عدد الوسائط غير صحيح."
  usage
  exit 1
fi

INGEST_DATE="$1"
SOURCE_SYSTEM="$2"

#############################################
# بناء مسار الملف على GCS
#############################################

GCS_URI="gs://${GCS_BUCKET}/${ENTITY_TYPE}/date=${INGEST_DATE}/source=${SOURCE_SYSTEM}/master_books.parquet"

#############################################
# التحقق من وجود الملف على GCS
#############################################

echo "🔎 التحقق من وجود الملف على GCS:"
echo "   ${GCS_URI}"

if ! gsutil ls "${GCS_URI}" > /dev/null 2>&1; then
  echo "❌ الملف غير موجود على GCS:"
  echo "   ${GCS_URI}"
  exit 1
fi

#############################################
# تنفيذ أمر التحميل إلى BigQuery
#############################################

FULL_TABLE="${PROJECT_ID}.${BQ_DATASET}.${BQ_TABLE}"

echo "============================================="
echo "📥 تحميل بيانات الكتب إلى BigQuery (Landing)"
echo "---------------------------------------------"
echo "مشروع جوجل كلاود : ${PROJECT_ID}"
echo "البكت            : ${GCS_BUCKET}"
echo "الملف على GCS    : ${GCS_URI}"
echo "Dataset           : ${BQ_DATASET}"
echo "Table             : ${BQ_TABLE}"
echo "الجدول الكامل    : ${FULL_TABLE}"
echo "============================================="
echo

echo "🚀 بدء عملية التحميل باستخدام bq load ..."

bq --project_id="${PROJECT_ID}" load \
  --source_format=PARQUET \
  --autodetect \
  --noreplace \
  "${FULL_TABLE}" \
  "${GCS_URI}"

echo
echo "✅ تم تحميل البيانات بنجاح إلى:"
echo "   ${FULL_TABLE}"
