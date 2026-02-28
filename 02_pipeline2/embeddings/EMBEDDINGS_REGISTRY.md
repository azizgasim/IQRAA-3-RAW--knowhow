# 📌 Embeddings Registry — IQRAA

## Official Table
- **Project:** iqraa-12
- **Dataset:** iqraa_academic_v2
- **Table:** embeddings_vectors

## Model
- gemini-embedding-001

## Schema (Verified)
- chunk_id: STRING (join key with unified_analysis)
- embedding: FLOAT REPEATED (vector)
- model: STRING
- created_at: TIMESTAMP

## Linkage
- `unified_analysis.chunk_id` = `embeddings_vectors.chunk_id`

## Last Verified
- 2026-02-24
