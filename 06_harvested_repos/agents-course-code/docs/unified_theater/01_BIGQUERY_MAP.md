# IQRA-12 BigQuery Map
## خريطة موارد BigQuery

---

## Overview

| Metric | Value |
|--------|-------|
| Project ID | `iqraa-12` |
| Location | US |
| Total Datasets | 6+ |
| Total Tables | 224+ |
| Primary Dataset | `diwan_iqraa_elmi` |

---

## Datasets

### 1. diwan_iqraa_elmi (Primary)
**الديوان العلمي - المصدر الرئيسي للنصوص**

| Table | Records | Description |
|-------|---------|-------------|
| `documents_text_chunks` | 157M+ | المقاطع النصية |
| `docs_partitioned` | - | الوثائق المقسمة |
| `chunk_embeddings` | - | المتجهات التمثيلية |
| `knowledge_graph_nodes` | - | عقد الرسم المعرفي |
| `knowledge_graph_edges` | - | علاقات الرسم المعرفي |

**Key Columns in documents_text_chunks:**
```
segment_uuid    STRING   - معرف المقطع
text            STRING   - النص
book_id         STRING   - معرف الكتاب
page_number     INT64    - رقم الصفحة
created_at      TIMESTAMP
```

### 2. dh_acquisition
**اقتناء المقالات والمجلات**

| Table | Description |
|-------|-------------|
| `journals` | سجل المجلات |
| `articles` | المقالات المستخرجة |
| `acquisition_runs` | سجل عمليات الاقتناء |

### 3. iqra_unified (New)
**الطبقة الموحدة**

| Table/View | Type | Description |
|------------|------|-------------|
| `source_registry` | TABLE | سجل المصادر |
| `passages_diwan` | MATERIALIZED VIEW | مقاطع الديوان |
| `passages_acquisition` | VIEW | مقاطع المقالات |
| `passages` | VIEW | المقاطع الموحدة |

### 4. ops (New)
**طبقة العمليات**

| Table | Description |
|-------|-------------|
| `runs` | سجل التشغيلات |
| `recipes` | مكتبة الوصفات |
| `agent_registry` | سجل الوكلاء |
| `decision_log` | سجل القرارات |
| `incidents` | سجل الحوادث |

### 5. evidence (New)
**طبقة الأدلة**

| Table | Description |
|-------|-------------|
| `bundles` | حزم الأدلة |
| `items` | عناصر الأدلة |
| `claims` | الادعاءات |
| `counter_evidence` | الأدلة المضادة |

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    RAW SOURCES                               │
│  diwan_iqraa_elmi.documents_text_chunks (157M)              │
│  dh_acquisition.articles                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 UNIFIED LAYER                                │
│  iqra_unified.passages (Combined View)                       │
│  iqra_unified.source_registry                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 OPERATIONS LAYER                             │
│  ops.runs → ops.recipes → ops.agent_registry                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 EVIDENCE LAYER                               │
│  evidence.bundles → evidence.items → evidence.claims         │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Queries

### Count all passages
```sql
SELECT COUNT(*) as total
FROM `iqraa-12.iqra_unified.passages`;
```

### Search passages
```sql
SELECT passage_id, text, source_type
FROM `iqraa-12.iqra_unified.passages`
WHERE SEARCH(text, 'المقاصد الشرعية')
LIMIT 100;
```

### Get run history
```sql
SELECT run_id, status, cost_actual_usd, created_at
FROM `iqraa-12.ops.runs`
ORDER BY created_at DESC
LIMIT 50;
```

---

*Last Updated: 2025-12-21*
