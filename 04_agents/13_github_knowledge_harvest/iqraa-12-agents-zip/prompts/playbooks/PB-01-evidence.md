# Playbook PB-01: Evidence Collection
# دليل جمع الأدلة

## Overview

| Attribute | Value |
|-----------|-------|
| Playbook ID | PB-01 |
| Name | Evidence Collection |
| Arabic Name | جمع الأدلة |
| Primary Agent | Evidencer (المحقق) |
| Supporting Agents | Linguist, Archivist |
| Gates Required | G-0, G-1 |

## Workflow Diagram

```
┌─────────────┐
│  User Query │
│  (Claim)    │
└──────┬──────┘
       │
       ▼
┌──────────────┐
│ G-0: تهيئة   │ ← Input validation
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Linguist    │ ← Arabic NLP
│  (اللغوي)    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Archivist   │ ← Query SSOT
│  (الخازن)    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Evidencer   │ ← Collect & Grade
│  (المحقق)    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ G-1: توثيق  │ ← Verify citations
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Output     │
│ EvidenceUnits│
└──────────────┘
```

## Steps

### Step 1: Input Processing (Linguist)

**Agent**: AGT-01-LINGUIST
**Action**: analyze_text
**Timeout**: 60s

```json
{
  "input": {
    "text": "{claim}",
    "analyze_morphology": true,
    "extract_entities": true
  },
  "output": {
    "linguistic_analysis": "LinguisticAnalysis"
  }
}
```

### Step 2: Source Search (Archivist)

**Agent**: AGT-04-ARCHIVIST
**Action**: search_sources
**Timeout**: 30s

```json
{
  "input": {
    "query": "{claim_keywords}",
    "tables": ["kb_store.sources", "kb_store.evidence_units"],
    "limit": 50
  },
  "output": {
    "sources": "List[Source]",
    "existing_evidence": "List[EvidenceUnit]"
  }
}
```

### Step 3: RAG Retrieval (Archivist)

**Agent**: AGT-04-ARCHIVIST
**Action**: semantic_search
**Timeout**: 30s

```json
{
  "input": {
    "query_embedding": "{claim_embedding}",
    "top_k": 20,
    "min_score": 0.7
  },
  "output": {
    "relevant_chunks": "List[SemanticChunk]"
  }
}
```

### Step 4: Evidence Collection (Evidencer)

**Agent**: AGT-05-EVIDENCER
**Action**: collect_evidence
**Timeout**: 60s

```json
{
  "input": {
    "claim": "{claim}",
    "linguistic_analysis": "{step1.output}",
    "sources": "{step2.output.sources}",
    "relevant_chunks": "{step3.output.relevant_chunks}"
  },
  "output": {
    "evidence_units": "List[EvidenceUnit]"
  }
}
```

### Step 5: Citation Verification (Evidencer)

**Agent**: AGT-05-EVIDENCER
**Action**: verify_citations
**Timeout**: 30s

```json
{
  "input": {
    "evidence_units": "{step4.output.evidence_units}"
  },
  "output": {
    "verified_units": "List[EvidenceUnit]",
    "verification_report": "VerificationReport"
  }
}
```

## Gate Requirements

### G-0: Input Validation

**Checks**:
- [ ] Claim is not empty
- [ ] Claim is in Arabic or English
- [ ] Claim length < 5000 characters
- [ ] No prohibited content

**Pass Criteria**: All checks pass

### G-1: Documentation Verification

**Checks**:
- [ ] Each EvidenceUnit has valid source
- [ ] Citations are complete (author, book, page)
- [ ] FRBR links are valid
- [ ] Context (before/after) is provided
- [ ] Grade is assigned

**Pass Criteria**: ≥80% of evidence units pass all checks

## Success Metrics

| Metric | Target |
|--------|--------|
| Evidence found | ≥1 unit |
| Citation accuracy | ≥95% |
| Average grade | ≥C |
| Processing time | <60s |

## Error Handling

| Error | Recovery |
|-------|----------|
| No sources found | Expand search criteria |
| Citation not verified | Flag for human review |
| Timeout | Return partial results |
| Low confidence | Add to review queue |

## Example Run

**Input**:
```json
{
  "claim": "العدل أساس الملك"
}
```

**Output**:
```json
{
  "evidence_units": [
    {
      "unit_id": "EV-001",
      "source_text": "العدل أساس الملك",
      "citation": {
        "author": "أبو حامد الغزالي",
        "book": "إحياء علوم الدين",
        "volume": 2,
        "page": 156
      },
      "grade": "B",
      "confidence": 0.9
    },
    {
      "unit_id": "EV-002",
      "source_text": "العدل أساس الملك ولا ملك إلا برجال",
      "citation": {
        "author": "ابن تيمية",
        "book": "السياسة الشرعية",
        "page": 23
      },
      "grade": "B",
      "confidence": 0.85
    }
  ],
  "total_found": 2,
  "gate_g1_passed": true
}
```
