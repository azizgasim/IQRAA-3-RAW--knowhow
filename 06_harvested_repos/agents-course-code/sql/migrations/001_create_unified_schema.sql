-- ═══════════════════════════════════════════════════════════════════════════════
--                    IQRA-12 Unified Layer
--                    Migration 001: Create Schema
-- ═══════════════════════════════════════════════════════════════════════════════

-- Step 1: Create unified schema
CREATE SCHEMA IF NOT EXISTS `iqraa-12.iqra_unified`
OPTIONS (
  description = 'الطبقة الموحدة - تجميع جميع المصادر',
  location = 'US'
);

-- Step 2: Source registry table
CREATE TABLE IF NOT EXISTS `iqra_unified.source_registry` (
  source_id STRING NOT NULL,
  source_type STRING NOT NULL,           -- 'diwan' | 'acquisition' | 'external'
  source_name STRING,
  original_dataset STRING NOT NULL,
  original_table STRING NOT NULL,
  total_records INT64,
  last_sync_at TIMESTAMP,
  is_active BOOL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  metadata JSON
)
PARTITION BY DATE(created_at)
OPTIONS (
  description = 'سجل المصادر المتاحة'
);

-- Step 3: Insert known sources
INSERT INTO `iqra_unified.source_registry` 
  (source_id, source_type, source_name, original_dataset, original_table, is_active)
VALUES
  ('diwan_chunks', 'diwan', 'ديوان إقرأ العلمي - المقاطع', 'diwan_iqraa_elmi', 'documents_text_chunks', TRUE),
  ('diwan_docs', 'diwan', 'ديوان إقرأ العلمي - الوثائق', 'diwan_iqraa_elmi', 'docs_partitioned', TRUE),
  ('acq_articles', 'acquisition', 'مقالات المجلات', 'dh_acquisition', 'articles', TRUE),
  ('acq_journals', 'acquisition', 'المجلات', 'dh_acquisition', 'journals', TRUE);
