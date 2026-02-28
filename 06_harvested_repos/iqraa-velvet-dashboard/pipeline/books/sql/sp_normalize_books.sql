-- sp_normalize_books.sql
-- إجراء تحويل بيانات الكتب من raw_landing.books_flat إلى curated_core.books_normalized

CREATE SCHEMA IF NOT EXISTS `iqraa-12.curated_core`;
CREATE SCHEMA IF NOT EXISTS `iqraa-12.pipeline_logs`;

-- جدول النتائج الموحّدة (إن لم يكن موجودًا)
CREATE TABLE IF NOT EXISTS `iqraa-12.curated_core.books_normalized` (
  record_id STRING,
  source_system STRING,
  ingest_date DATE,
  doc_type STRING,
  title STRING,
  main_author_normalized STRING,
  publication_year INT64,
  language_code STRING,
  discipline STRING,
  quality_score FLOAT64,
  raw_metadata JSON
);

-- جدول أخطاء التحويل الخاص بالكتب (إن لم يكن موجودًا)
CREATE TABLE IF NOT EXISTS `iqraa-12.pipeline_logs.books_transform_errors` (
  run_id STRING,
  error_timestamp TIMESTAMP,
  record_id STRING,
  source_system STRING,
  year_raw STRING,
  error_type STRING,
  raw_row JSON
);

-- (اختياري) جدول لوق لتشغيلات التحويل
CREATE TABLE IF NOT EXISTS `iqraa-12.pipeline_logs.transform_runs` (
  run_id STRING,
  stage STRING,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  rows_read INT64,
  rows_written INT64,
  rows_error INT64,
  status STRING,
  message STRING
);

CREATE OR REPLACE PROCEDURE `iqraa-12.curated_core.sp_normalize_books`()
BEGIN
  DECLARE run_id STRING DEFAULT GENERATE_UUID();
  DECLARE start_ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP();
  DECLARE end_ts TIMESTAMP;
  DECLARE rows_read INT64 DEFAULT 0;
  DECLARE rows_written INT64 DEFAULT 0;
  DECLARE rows_error INT64 DEFAULT 0;

  -- نشتغل على دفعة "جديدة" فقط: أي السجلات التي لا وجود لها في books_normalized
  CREATE TEMP TABLE src_new AS
  SELECT
    rl.record_id,
    rl.source_system,
    DATE(rl.ingest_timestamp) AS ingest_date,
    rl.doc_type,
    rl.title,
    rl.main_author AS main_author_raw,
    rl.year_raw,
    rl.language_code,
    rl.discipline_raw,
    rl.raw_metadata
  FROM `iqraa-12.raw_landing.books_flat` rl
  LEFT JOIN `iqraa-12.curated_core.books_normalized` bn
    ON rl.record_id = bn.record_id
  WHERE bn.record_id IS NULL;

  SET rows_read = (SELECT COUNT(*) FROM src_new);

  -- تسجيل السجلات التي فيها year_raw غير قابلة للتحويل
  INSERT INTO `iqraa-12.pipeline_logs.books_transform_errors` (
    run_id,
    error_timestamp,
    record_id,
    source_system,
    year_raw,
    error_type,
    raw_row
  )
  SELECT
    run_id,
    CURRENT_TIMESTAMP(),
    record_id,
    source_system,
    year_raw,
    'INVALID_YEAR',
    TO_JSON(STRUCT(*))
  FROM src_new
  WHERE
    year_raw IS NOT NULL
    AND year_raw != ''
    AND SAFE_CAST(year_raw AS INT64) IS NULL;

  SET rows_error = (SELECT COUNT(*) FROM src_new
                    WHERE year_raw IS NOT NULL
                      AND year_raw != ''
                      AND SAFE_CAST(year_raw AS INT64) IS NULL);

  -- إدخال/تحديث السجلات السليمة في books_normalized
  MERGE `iqraa-12.curated_core.books_normalized` T
  USING (
    SELECT
      record_id,
      source_system,
      ingest_date,
      doc_type,
      title,
      -- للتبسيط الآن: نعتبر main_author_normalized = main_author_raw
      main_author_raw AS main_author_normalized,
      SAFE_CAST(NULLIF(year_raw, '') AS INT64) AS publication_year,
      language_code,
      -- نطبع discipline_raw كما هي حاليًا (التطبيع المتقدم لاحقًا)
      discipline_raw AS discipline,
      1.0 AS quality_score,
      raw_metadata
    FROM src_new
    WHERE
      -- نستثني فقط الحالات التي year_raw فيها نص غير قابل للتحويل (سُجّل في جدول الأخطاء)
      NOT (year_raw IS NOT NULL
           AND year_raw != ''
           AND SAFE_CAST(year_raw AS INT64) IS NULL)
  ) S
  ON T.record_id = S.record_id
  WHEN MATCHED THEN
    UPDATE SET
      T.source_system = S.source_system,
      T.ingest_date = S.ingest_date,
      T.doc_type = S.doc_type,
      T.title = S.title,
      T.main_author_normalized = S.main_author_normalized,
      T.publication_year = S.publication_year,
      T.language_code = S.language_code,
      T.discipline = S.discipline,
      T.quality_score = S.quality_score,
      T.raw_metadata = S.raw_metadata
  WHEN NOT MATCHED THEN
    INSERT (
      record_id,
      source_system,
      ingest_date,
      doc_type,
      title,
      main_author_normalized,
      publication_year,
      language_code,
      discipline,
      quality_score,
      raw_metadata
    )
    VALUES (
      S.record_id,
      S.source_system,
      S.ingest_date,
      S.doc_type,
      S.title,
      S.main_author_normalized,
      S.publication_year,
      S.language_code,
      S.discipline,
      S.quality_score,
      S.raw_metadata
    );

  SET rows_written = (
    SELECT COUNT(*)
    FROM `iqraa-12.curated_core.books_normalized` bn
    WHERE bn.record_id IN (SELECT record_id FROM src_new)
  );

  SET end_ts = CURRENT_TIMESTAMP();

  -- تسجيل تشغيل الإجراء في جدول transform_runs
  INSERT INTO `iqraa-12.pipeline_logs.transform_runs` (
    run_id,
    stage,
    start_time,
    end_time,
    rows_read,
    rows_written,
    rows_error,
    status,
    message
  )
  VALUES (
    run_id,
    'BOOKS_NORMALIZE',
    start_ts,
    end_ts,
    rows_read,
    rows_written,
    rows_error,
    'SUCCESS',
    CONCAT('Books normalize run completed. rows_read=', rows_read,
           ', rows_written=', rows_written,
           ', rows_error=', rows_error)
  );

END;
