-- ═══════════════════════════════════════════════════════════════════════════════
--                    IQRA-12 Operations Layer
--                    Migration 003: OPS Schema
-- ═══════════════════════════════════════════════════════════════════════════════

-- Step 1: Create ops schema
CREATE SCHEMA IF NOT EXISTS `iqraa-12.ops`
OPTIONS (
  description = 'طبقة العمليات والتشغيل',
  location = 'US'
);

-- Step 2: Runs table (سجل التشغيلات)
CREATE TABLE IF NOT EXISTS `ops.runs` (
  run_id STRING NOT NULL,
  project_id STRING NOT NULL,
  recipe_id STRING,
  user_id STRING,
  
  -- Scope
  corpus_scope ARRAY<STRING>,
  question STRING,
  
  -- Execution
  status STRING NOT NULL,           -- 'pending' | 'running' | 'completed' | 'failed'
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Results
  operations_executed ARRAY<STRING>,
  artifacts_created ARRAY<STRING>,
  tables_touched ARRAY<STRING>,
  
  -- Cost & Performance
  cost_budget_usd FLOAT64,
  cost_actual_usd FLOAT64,
  tokens_used INT64,
  
  -- Metadata
  error_message STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(created_at)
CLUSTER BY project_id, status
OPTIONS (
  description = 'سجل تشغيلات الوكلاء'
);

-- Step 3: Recipes table (مكتبة الوصفات)
CREATE TABLE IF NOT EXISTS `ops.recipes` (
  recipe_id STRING NOT NULL,
  name STRING NOT NULL,
  name_ar STRING,
  description STRING,
  
  -- Definition
  operations ARRAY<STRUCT<
    step_order INT64,
    operation_id STRING,
    parameters JSON,
    depends_on ARRAY<STRING>
  >>,
  
  -- Metadata
  category STRING,                  -- 'search' | 'analysis' | 'synthesis'
  estimated_cost_usd FLOAT64,
  avg_duration_seconds INT64,
  
  -- Versioning
  version STRING DEFAULT '1.0.0',
  is_active BOOL DEFAULT TRUE,
  created_by STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP
)
OPTIONS (
  description = 'مكتبة وصفات العمليات'
);

-- Step 4: Agent Registry (سجل الوكلاء)
CREATE TABLE IF NOT EXISTS `ops.agent_registry` (
  agent_id STRING NOT NULL,
  name STRING NOT NULL,
  name_ar STRING,
  
  -- Card
  purpose STRING,
  purpose_ar STRING,
  inputs ARRAY<STRING>,
  outputs ARRAY<STRING>,
  
  -- Constraints
  autonomy_level STRING NOT NULL,   -- 'L0' | 'L1' | 'L2' | 'L3' | 'L4'
  risk_tier STRING,                 -- 'low' | 'medium' | 'high' | 'critical'
  max_cost_per_run_usd FLOAT64,
  
  -- Permissions
  tables_read ARRAY<STRING>,
  tables_write ARRAY<STRING>,
  
  -- Metadata
  owner STRING,
  is_active BOOL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
OPTIONS (
  description = 'سجل الوكلاء المعتمدين'
);

-- Step 5: Decision Log (سجل القرارات)
CREATE TABLE IF NOT EXISTS `ops.decision_log` (
  decision_id STRING NOT NULL,
  run_id STRING NOT NULL,
  agent_id STRING,
  operation_id STRING,
  
  -- Decision
  decision_type STRING,             -- 'merge' | 'claim' | 'publish' | 'escalate'
  decision_value STRING,
  confidence FLOAT64,
  
  -- Reasoning
  reasoning STRING,
  evidence_ids ARRAY<STRING>,
  
  -- Human Review
  requires_review BOOL DEFAULT FALSE,
  reviewed_by STRING,
  reviewed_at TIMESTAMP,
  review_decision STRING,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(created_at)
OPTIONS (
  description = 'سجل قرارات الوكلاء للمراجعة'
);

-- Step 6: Incidents table (الحوادث)
CREATE TABLE IF NOT EXISTS `ops.incidents` (
  incident_id STRING NOT NULL,
  run_id STRING,
  agent_id STRING,
  
  severity STRING NOT NULL,         -- 'low' | 'medium' | 'high' | 'critical'
  incident_type STRING,             -- 'cost_overrun' | 'autonomy_violation' | 'quality_failure'
  
  description STRING,
  resolution STRING,
  resolved_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
OPTIONS (
  description = 'سجل الحوادث والمشاكل'
);
