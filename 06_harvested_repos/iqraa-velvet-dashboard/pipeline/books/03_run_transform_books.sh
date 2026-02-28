#!/usr/bin/env bash
# 03_run_transform_books.sh
# استدعاء إجراء sp_normalize_books لتحويل بيانات الكتب

set -euo pipefail

PROJECT_ID="iqraa-12"

echo "============================================="
echo "⚙️ تشغيل إجراء تحويل الكتب: sp_normalize_books"
echo "مشروع جوجل كلاود : ${PROJECT_ID}"
echo "الوقت              : $(date -Iseconds)"
echo "============================================="
echo

START_TS=$(date -Iseconds)

bq --project_id="${PROJECT_ID}" query \
  --use_legacy_sql=false \
  "CALL \`iqraa-12.curated_core.sp_normalize_books\`();"

EXIT_CODE=$?

END_TS=$(date -Iseconds)

if [[ ${EXIT_CODE} -eq 0 ]]; then
  echo
  echo "✅ تم تنفيذ sp_normalize_books بنجاح."
  echo "⏱️ البداية : ${START_TS}"
  echo "⏱️ النهاية : ${END_TS}"
else
  echo
  echo "❌ فشل تنفيذ sp_normalize_books. كود الخروج: ${EXIT_CODE}"
  echo "⏱️ البداية : ${START_TS}"
  echo "⏱️ النهاية : ${END_TS}"
  exit ${EXIT_CODE}
fi
