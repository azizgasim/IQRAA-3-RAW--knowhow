#!/usr/bin/env bash
# 04_run_dispatch_books.sh
# استدعاء إجراء sp_dispatch_books لتوزيع بيانات الكتب على الجداول النهائية

set -euo pipefail

PROJECT_ID="iqraa-12"

echo "============================================="
echo "🚚 تشغيل إجراء توزيع الكتب: sp_dispatch_books"
echo "مشروع جوجل كلاود : ${PROJECT_ID}"
echo "الوقت              : $(date -Iseconds)"
echo "============================================="
echo

START_TS=$(date -Iseconds)

bq --project_id="${PROJECT_ID}" query \
  --use_legacy_sql=false \
  "CALL \`iqraa-12.curated_core.sp_dispatch_books\`();"

EXIT_CODE=$?

END_TS=$(date -Iseconds)

if [[ ${EXIT_CODE} -eq 0 ]]; then
  echo
  echo "✅ تم تنفيذ sp_dispatch_books بنجاح."
  echo "⏱️ البداية : ${START_TS}"
  echo "⏱️ النهاية : ${END_TS}"
else
  echo
  echo "❌ فشل تنفيذ sp_dispatch_books. كود الخروج: ${EXIT_CODE}"
  echo "⏱️ البداية : ${START_TS}"
  echo "⏱️ النهاية : ${END_TS}"
  exit ${EXIT_CODE}
fi
