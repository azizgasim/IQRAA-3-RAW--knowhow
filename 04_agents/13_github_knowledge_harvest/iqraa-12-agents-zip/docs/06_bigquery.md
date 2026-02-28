# BigQuery Schema

## IQRA System v1.3 - 21 Tables

---

## Datasets

| Dataset | Purpose | Tables |
|---------|---------|--------|
| `iqra_ops_logs` | Operational logging | 8 |
| `iqra_kb_store` | Knowledge base storage | 13 |

---

## ops_logs Dataset (8 tables)

### 1. run_index
One record per execution.

```sql
CREATE TABLE iqra_ops_logs.run_index (
  run_id STRING NOT NULL,
  user_id STRING,
  query_text STRING,
  query_type STRING,
  playbook_id STRING,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  status STRING,  -- pending/running/completed/failed
  final_gate STRING,
  total_cost_usd FLOAT64,
  total_tokens INT64,
  error_message STRING,
  metadata JSON
);
```

### 2. journal_entries
Flexible event log.

```sql
CREATE TABLE iqra_ops_logs.journal_entries (
  entry_id STRING NOT NULL,
  run_id STRING,
  timestamp TIMESTAMP,
  agent_id STRING,
  event_type STRING,
  severity STRING,  -- debug/info/warn/error
  message STRING,
  details JSON
);
```

### 3. gate_events
Structured Gate records.

```sql
CREATE TABLE iqra_ops_logs.gate_events (
  event_id STRING NOT NULL,
  run_id STRING,
  gate_id STRING,  -- G-0 to G-5
  agent_id STRING,
  timestamp TIMESTAMP,
  input_hash STRING,
  checks_performed ARRAY<STRING>,
  checks_passed INT64,
  checks_failed INT64,
  result STRING,  -- pass/fail/warn
  details JSON,
  latency_ms INT64,
  next_action STRING
);
```

### 4. agent_messages
Communication log.

```sql
CREATE TABLE iqra_ops_logs.agent_messages (
  message_id STRING NOT NULL,
  run_id STRING,
  from_agent STRING,
  to_agent STRING,
  message_type STRING,
  timestamp TIMESTAMP,
  payload JSON,
  correlation_id STRING,
  trace_id STRING
);
```

### 5. error_log
Basic error log (legacy).

```sql
CREATE TABLE iqra_ops_logs.error_log (
  error_id STRING NOT NULL,
  run_id STRING,
  timestamp TIMESTAMP,
  agent_id STRING,
  error_type STRING,
  error_message STRING,
  stack_trace STRING
);
```

### 6. error_registry (NEW v1.3)
Centralized error tracking.

```sql
CREATE TABLE iqra_ops_logs.error_registry (
  error_id STRING NOT NULL,
  run_id STRING,
  agent_id STRING,
  timestamp TIMESTAMP,
  error_type STRING,  -- validation/processing/integration/timeout
  error_code STRING,  -- E001, E002, etc.
  severity STRING,  -- critical/high/medium/low
  error_message STRING,
  input_snapshot JSON,
  output_snapshot JSON,
  gate_id STRING,
  root_cause STRING,
  resolution STRING,
  prevention_rule STRING,
  status STRING  -- open/analyzing/resolved/learned
);
```

### 7. error_patterns (NEW v1.3)
Discovered error patterns.

```sql
CREATE TABLE iqra_ops_logs.error_patterns (
  pattern_id STRING NOT NULL,
  pattern_name STRING,
  detection_rule JSON,
  affected_agents ARRAY<STRING>,
  occurrence_count INT64,
  recommended_fix STRING,
  auto_fix_available BOOL,
  success_rate_after_fix FLOAT64,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 8. human_review_queue (NEW v1.3)
Human review requests.

```sql
CREATE TABLE iqra_ops_logs.human_review_queue (
  review_id STRING NOT NULL,
  run_id STRING,
  artifact_type STRING,  -- evidence/theory/claim/export
  artifact_id STRING,
  trigger_type STRING,  -- confidence/topic/gate/method
  current_level INT64,  -- 1-3
  assigned_reviewer STRING,
  assigned_at TIMESTAMP,
  decision STRING,  -- pending/approved/rejected/needs_revision
  decision_reason STRING,
  decided_at TIMESTAMP,
  status STRING  -- pending/in_review/decided
);
```

---

## kb_store Dataset (13 tables)

### 1. sources
Books, papers, manuscripts.

```sql
CREATE TABLE iqra_kb_store.sources (
  source_id STRING NOT NULL,
  title_ar STRING,
  title_en STRING,
  author_ar STRING,
  author_en STRING,
  source_type STRING,  -- book/article/manuscript/thesis
  publication_year INT64,
  publisher STRING,
  language STRING,
  subject_tags ARRAY<STRING>,
  digital_url STRING,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 2. notes
Summaries, excerpts, critiques.

```sql
CREATE TABLE iqra_kb_store.notes (
  note_id STRING NOT NULL,
  source_id STRING,
  note_type STRING,  -- summary/excerpt/critique/annotation
  content STRING,
  page_ref STRING,
  created_by STRING,
  created_at TIMESTAMP,
  tags ARRAY<STRING>
);
```

### 3. concept_cards
Operational definitions.

```sql
CREATE TABLE iqra_kb_store.concept_cards (
  concept_id STRING NOT NULL,
  term_ar STRING,
  term_en STRING,
  definition STRING,
  domain STRING,
  etymology STRING,
  related_concepts ARRAY<STRING>,
  evidence_ids ARRAY<STRING>,
  confidence FLOAT64,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 4. evidence_units
Evidence records (Updated v1.3).

```sql
CREATE TABLE iqra_kb_store.evidence_units (
  evidence_id STRING NOT NULL,
  claim_text STRING,
  source_type STRING,
  -- FRBR fields (NEW v1.3)
  work_id STRING,
  expression_id STRING,
  manifestation_id STRING,
  item_id STRING,
  -- Location
  volume INT64,
  page_start INT64,
  page_end INT64,
  line_start INT64,
  line_end INT64,
  -- Context
  quote_text STRING,
  context_before STRING,  -- 100 chars
  context_after STRING,   -- 100 chars
  -- Verification
  verified_against_original BOOL,
  linguistic_analysis_id STRING,
  -- Metadata
  confidence FLOAT64,
  created_at TIMESTAMP,
  created_by STRING
);
```

### 5. context_units
Hidden context records.

```sql
CREATE TABLE iqra_kb_store.context_units (
  context_id STRING NOT NULL,
  concept_id STRING,
  context_type STRING,  -- historical/cultural/political/intellectual
  description STRING,
  era STRING,
  location STRING,
  key_figures ARRAY<STRING>,
  evidence_ids ARRAY<STRING>,
  created_at TIMESTAMP
);
```

### 6. lineage_links
Transfer chains.

```sql
CREATE TABLE iqra_kb_store.lineage_links (
  link_id STRING NOT NULL,
  source_concept_id STRING,
  target_concept_id STRING,
  link_type STRING,  -- influence/derivation/opposition/synthesis
  direction STRING,  -- forward/backward/bidirectional
  strength FLOAT64,
  evidence_ids ARRAY<STRING>,
  temporal_order INT64,
  created_at TIMESTAMP
);
```

### 7. spark_cards
Scout discoveries.

```sql
CREATE TABLE iqra_kb_store.spark_cards (
  spark_id STRING NOT NULL,
  discovery_type STRING,  -- pattern/gap/connection/anomaly
  title STRING,
  description STRING,
  related_concepts ARRAY<STRING>,
  evidence_ids ARRAY<STRING>,
  confidence FLOAT64,
  priority STRING,  -- high/medium/low
  status STRING,  -- new/investigating/confirmed/rejected
  created_at TIMESTAMP
);
```

### 8. theory_cards
Theorist outputs.

```sql
CREATE TABLE iqra_kb_store.theory_cards (
  theory_id STRING NOT NULL,
  title STRING,
  thesis STRING,
  argument_structure JSON,
  grounding_evidence ARRAY<STRING>,
  related_theories ARRAY<STRING>,
  confidence FLOAT64,
  status STRING,  -- draft/reviewed/published
  gate_passed STRING,
  created_at TIMESTAMP
);
```

### 9. works (NEW v1.3 - FRBR)
FRBR Works.

```sql
CREATE TABLE iqra_kb_store.works (
  work_id STRING NOT NULL,
  title_ar STRING,
  title_en STRING,
  author_id STRING,
  creation_date STRING,
  work_type STRING,  -- book/risala/diwan/sharh/mukhtasar
  related_works ARRAY<STRING>,
  derivative_of STRING,
  created_at TIMESTAMP
);
```

### 10. expressions (NEW v1.3 - FRBR)
FRBR Expressions.

```sql
CREATE TABLE iqra_kb_store.expressions (
  expression_id STRING NOT NULL,
  work_id STRING,
  expression_type STRING,  -- original/sharh/mukhtasar/translation
  language STRING,
  translator_id STRING,
  created_at TIMESTAMP
);
```

### 11. manifestations (NEW v1.3 - FRBR)
FRBR Manifestations.

```sql
CREATE TABLE iqra_kb_store.manifestations (
  manifestation_id STRING NOT NULL,
  expression_id STRING,
  publisher STRING,
  publication_year INT64,
  edition_number INT64,
  editor_id STRING,
  scholarly_edition BOOL,
  tahqiq_quality STRING,  -- excellent/good/fair/poor
  created_at TIMESTAMP
);
```

### 12. items (NEW v1.3 - FRBR)
FRBR Items.

```sql
CREATE TABLE iqra_kb_store.items (
  item_id STRING NOT NULL,
  manifestation_id STRING,
  holding_institution STRING,
  call_number STRING,
  digital_copy_url STRING,
  ocr_quality FLOAT64,
  created_at TIMESTAMP
);
```

### 13. semantic_index_metadata (NEW v1.3)
RAG index metadata.

```sql
CREATE TABLE iqra_kb_store.semantic_index_metadata (
  chunk_id STRING NOT NULL,
  source_table STRING,
  source_id STRING,
  chunk_text STRING,
  chunk_position INT64,
  source_type STRING,
  author STRING,
  era STRING,
  topic_tags ARRAY<STRING>,
  linguistic_analysis_id STRING,
  indexed_at TIMESTAMP
);
```

---

## Embedding Table (Vertex AI)

Embeddings are stored in Vertex AI Vector Search, with metadata reference:

```sql
-- Reference table linking to vector index
CREATE TABLE iqra_kb_store.embedding_references (
  embedding_id STRING NOT NULL,
  chunk_id STRING,
  vector_index_id STRING,
  embedding_model STRING,
  dimensions INT64,
  created_at TIMESTAMP
);
```

---

**Document Version:** 1.3  
**Last Updated:** January 2026  
**Status:** FINAL - Source of Truth
