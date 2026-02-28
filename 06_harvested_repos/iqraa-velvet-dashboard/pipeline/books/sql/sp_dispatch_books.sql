-- sp_dispatch_books.sql
-- توزيع كتب books_normalized إلى الجدول النهائي diwan_iqraa_elmi.bibliographic_entries

-- إنشاء جدول لوق للتوزيع إن لم يكن موجودًا
CREATE SCHEMA IF NOT EXISTS `iqraa-12.pipeline_logs`;

CREATE TABLE IF NOT EXISTS `iqraa-12.pipeline_logs.dispatch_runs` (
  run_id STRING,
  stage STRING,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  rows_input INT64,
  rows_affected INT64,
  status STRING,
  message STRING
);

CREATE OR REPLACE PROCEDURE `iqraa-12.curated_core.sp_dispatch_books`()
BEGIN
  DECLARE run_id STRING DEFAULT GENERATE_UUID();
  DECLARE start_ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP();
  DECLARE end_ts TIMESTAMP;
  DECLARE rows_input INT64 DEFAULT 0;
  DECLARE rows_affected INT64 DEFAULT 0;

  -- تحضير السجلات التي ستُرسل للجدول النهائي
  CREATE TEMP TABLE to_dispatch AS
  SELECT
    bn.record_id AS entry_id,
    bn.source_system,
    bn.ingest_date,
    bn.doc_type,
    bn.title,
    bn.main_author_normalized AS author,
    bn.publication_year,
    bn.language_code,
    bn.discipline,
    bn.quality_score,
    bn.raw_metadata
  FROM `iqraa-12.curated_core.books_normalized` bn
  WHERE
    -- يمكن تعديل قائمة التخصصات لاحقًا
    bn.doc_type = 'BOOK'
    AND bn.discipline IN ('IslamicStudies', 'Fiqh', 'Hadith', 'Quran');

  SET rows_input = (SELECT COUNT(*) FROM to_dispatch);

  -- الدمج في الجدول النهائي
  MERGE `iqraa-12.diwan_iqraa_elmi.bibliographic_entries` T
  USING to_dispatch S
  ON T.entry_id = S.entry_id
  WHEN MATCHED THEN
    UPDATE SET
      T.source_system      = S.source_system,
      T.ingest_date        = S.ingest_date,
      T.doc_type           = S.doc_type,
      T.title              = S.title,
      T.author             = S.author,
      T.publication_year   = S.publication_year,
      T.language_code      = S.language_code,
      T.discipline         = S.discipline,
      T.quality_score      = S.quality_score,
      T.raw_metadata       = S.raw_metadata
  WHEN NOT MATCHED THEN
    INSERT (
      entry_id,
      source_system,
      ingest_date,
      doc_type,
      title,
      author,
      publication_year,
      language_code,
      discipline,
      quality_score,
      raw_metadata
    )
    VALUES (
      S.entry_id,
      S.source_system,
      S.ingest_date,
      S.doc_type,
      S.title,
      S.author,
      S.publication_year,
      S.language_code,
      S.discipline,
      S.quality_score,
      S.raw_metadata
    );

  -- تقدير عدد الصفوف المتأثرة (هنا: عدد المدخلات المرشّحة)
  SET rows_affected = rows_input;

  SET end_ts = CURRENT_TIMESTAMP();

  -- تسجيل تشغيل الإجراء في جدول dispatch_runs
  INSERT INTO `iqraa-12.pipeline_logs.dispatch_runs` (
    run_id,
    stage,
    start_time,
    end_time,
    rows_input,
    rows_affected,
    status,
    message
  )
  VALUES (
    run_id,
    'BOOKS_DISPATCH',
    start_ts,
    end_ts,
    rows_input,
    rows_affected,
    'SUCCESS',
    CONCAT(
      'Books dispatch completed. rows_input=',
      CAST(rows_input AS STRING),
      ', rows_affected=',
      CAST(rows_affected AS STRING)
    )
  );

END;
