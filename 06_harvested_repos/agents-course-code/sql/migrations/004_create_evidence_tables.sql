-- ═══════════════════════════════════════════════════════════════════════════════
--                    IQRA-12 Evidence Layer
--                    Migration 004: Evidence & Claims
-- ═══════════════════════════════════════════════════════════════════════════════

-- Step 1: Create evidence schema
CREATE SCHEMA IF NOT EXISTS `iqraa-12.evidence`
OPTIONS (
  description = 'طبقة الأدلة والادعاءات',
  location = 'US'
);

-- Step 2: Evidence Bundles (حزم الأدلة)
CREATE TABLE IF NOT EXISTS `evidence.bundles` (
  bundle_id STRING NOT NULL,
  run_id STRING NOT NULL,
  project_id STRING NOT NULL,
  
  -- Content
  query STRING,
  hypothesis STRING,
  
  -- Metadata
  total_items INT64,
  avg_confidence FLOAT64,
  coverage_score FLOAT64,
  
  -- Status
  status STRING,                    -- 'draft' | 'reviewed' | 'approved'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  approved_at TIMESTAMP,
  approved_by STRING
)
PARTITION BY DATE(created_at)
OPTIONS (
  description = 'حزم الأدلة المجمعة'
);

-- Step 3: Evidence Items (عناصر الأدلة)
CREATE TABLE IF NOT EXISTS `evidence.items` (
  evidence_id STRING NOT NULL,
  bundle_id STRING NOT NULL,
  
  -- Source
  passage_id STRING NOT NULL,
  source_type STRING,
  work_id STRING,
  
  -- Location (Non-negotiable: لا دليل بدون offsets)
  offset_start INT64 NOT NULL,
  offset_end INT64 NOT NULL,
  text_snippet STRING,
  
  -- Relevance
  relevance_score FLOAT64,
  semantic_similarity FLOAT64,
  
  -- Classification
  evidence_type STRING,             -- 'supporting' | 'contradicting' | 'neutral'
  stance STRING,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(created_at)
CLUSTER BY bundle_id
OPTIONS (
  description = 'عناصر الأدلة الفردية'
);

-- Step 4: Claims (الادعاءات)
CREATE TABLE IF NOT EXISTS `evidence.claims` (
  claim_id STRING NOT NULL,
  run_id STRING NOT NULL,
  project_id STRING NOT NULL,
  
  -- Content (Non-negotiable: لا ادعاء بدون أدلة)
  claim_text STRING NOT NULL,
  claim_text_ar STRING,
  
  -- Evidence
  supporting_bundle_id STRING NOT NULL,
  counter_bundle_id STRING,
  
  -- Confidence
  confidence FLOAT64,
  evidence_strength FLOAT64,
  counter_evidence_strength FLOAT64,
  
  -- Scope
  scope_description STRING,
  limitations ARRAY<STRING>,
  
  -- Review (Non-negotiable: لا نشر بدون V4)
  v1_passed BOOL DEFAULT FALSE,     -- Citation Audit
  v2_passed BOOL DEFAULT FALSE,     -- Consistency Audit  
  v4_passed BOOL DEFAULT FALSE,     -- Provenance Audit
  
  -- Status
  status STRING,                    -- 'draft' | 'under_review' | 'approved' | 'published'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  published_at TIMESTAMP
)
PARTITION BY DATE(created_at)
OPTIONS (
  description = 'سجل الادعاءات المبنية على الأدلة'
);

-- Step 5: Counter Evidence (الأدلة المضادة)
CREATE TABLE IF NOT EXISTS `evidence.counter_evidence` (
  counter_id STRING NOT NULL,
  claim_id STRING NOT NULL,
  evidence_id STRING NOT NULL,
  
  -- Analysis
  contradiction_type STRING,        -- 'direct' | 'contextual' | 'temporal' | 'scope'
  explanation STRING,
  severity FLOAT64,                 -- 0.0 to 1.0
  
  -- Resolution
  resolution_status STRING,         -- 'unresolved' | 'explained' | 'invalidates_claim'
  resolution_notes STRING,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
OPTIONS (
  description = 'سجل الأدلة المضادة'
);
