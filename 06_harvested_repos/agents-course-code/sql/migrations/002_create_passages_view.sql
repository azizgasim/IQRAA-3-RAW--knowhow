-- ═══════════════════════════════════════════════════════════════════════════════
--                    IQRA-12 Unified Layer
--                    Migration 002: Passages Views
-- ═══════════════════════════════════════════════════════════════════════════════

-- Step 1: MATERIALIZED VIEW for diwan chunks (الأساسي - يُحدث أسبوعياً)
CREATE MATERIALIZED VIEW IF NOT EXISTS `iqra_unified.passages_diwan`
OPTIONS (
  enable_refresh = true,
  refresh_interval_minutes = 10080,  -- Weekly
  description = 'مقاطع ديوان إقرأ العلمي'
)
AS
SELECT 
  CONCAT('diwan_', segment_uuid) AS passage_id,
  'diwan' AS source_type,
  segment_uuid AS original_id,
  text,
  CAST(NULL AS INT64) AS offset_start,
  CAST(NULL AS INT64) AS offset_end,
  book_id AS work_id,
  CAST(NULL AS STRING) AS author_id,
  CAST(NULL AS INT64) AS century,
  CAST(NULL AS ARRAY<STRING>) AS topic_tags,
  CAST(NULL AS FLOAT64) AS quality_score,
  CURRENT_TIMESTAMP() AS indexed_at
FROM `diwan_iqraa_elmi.documents_text_chunks`
WHERE text IS NOT NULL AND LENGTH(text) > 10;

-- Step 2: VIEW for acquisition articles (محدث دائماً)
CREATE OR REPLACE VIEW `iqra_unified.passages_acquisition` AS
SELECT 
  CONCAT('acq_', CAST(article_id AS STRING)) AS passage_id,
  'acquisition' AS source_type,
  CAST(article_id AS STRING) AS original_id,
  content AS text,
  CAST(NULL AS INT64) AS offset_start,
  CAST(NULL AS INT64) AS offset_end,
  CAST(journal_id AS STRING) AS work_id,
  CAST(NULL AS STRING) AS author_id,
  CAST(NULL AS INT64) AS century,
  CAST(NULL AS ARRAY<STRING>) AS topic_tags,
  CAST(NULL AS FLOAT64) AS quality_score,
  created_at AS indexed_at
FROM `dh_acquisition.articles`
WHERE content IS NOT NULL;

-- Step 3: Combined VIEW (النقطة الموحدة للوصول)
CREATE OR REPLACE VIEW `iqra_unified.passages` AS
SELECT * FROM `iqra_unified.passages_diwan`
UNION ALL
SELECT * FROM `iqra_unified.passages_acquisition`;

-- Step 4: Statistics table
CREATE TABLE IF NOT EXISTS `iqra_unified.passages_stats` (
  stat_date DATE NOT NULL,
  source_type STRING NOT NULL,
  total_passages INT64,
  avg_text_length FLOAT64,
  min_text_length INT64,
  max_text_length INT64,
  computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY stat_date
OPTIONS (
  description = 'إحصائيات المقاطع اليومية'
);
