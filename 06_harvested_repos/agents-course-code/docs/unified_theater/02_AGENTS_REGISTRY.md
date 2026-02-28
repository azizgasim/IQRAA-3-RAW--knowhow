# IQRA-12 Agents Registry
## سجل الوكلاء

---

## Overview

| Metric | Count |
|--------|-------|
| Planned Agents | 74 |
| Documented | 18 |
| Implemented (Code) | 44 Operations |
| Integrated with BigQuery | 5 |
| Production Ready | 0 |

---

## Agent Categories

### 1. Search Agents (وكلاء البحث)
| Agent | Status | File |
|-------|--------|------|
| Recipe Builder | 📋 Planned | - |
| Evidence Hunter | 📋 Planned | - |
| Counter-Evidence Seeker | 📋 Planned | - |

### 2. Link Agents (وكلاء الربط)
| Agent | Status | File |
|-------|--------|------|
| Entity Extractor | ✅ Implemented | `operations/extract/entity_extraction.py` |
| Identity Resolver | ✅ Implemented | `operations/link/entity_resolution.py` |
| Relation Proposer | ✅ Implemented | `operations/extract/relation_extraction.py` |

### 3. Infer Agents (وكلاء الاستنتاج)
| Agent | Status | File |
|-------|--------|------|
| Claim Drafter | ✅ Implemented | `operations/construct/claim_construction.py` |
| Scope Setter | 📋 Planned | - |
| Uncertainty Assessor | 📋 Planned | - |

### 4. Write Agents (وكلاء الكتابة)
| Agent | Status | File |
|-------|--------|------|
| Outline Builder | ✅ Implemented | `operations/construct/outline_construction.py` |
| Section Writer | ✅ Implemented | `operations/write/section_writing.py` |
| Citation Auditor | ✅ Implemented | `operations/verify/citation_audit.py` |

### 5. Governance Agents (وكلاء الحوكمة)
| Agent | Status | File |
|-------|--------|------|
| Rights Checker | ✅ Implemented | `operations/verify/rights_audit.py` |
| Quality Auditor | ✅ Implemented | `operations/verify/consistency_audit.py` |
| Cost Monitor | 📋 Planned | - |

### 6. Gap Agents (وكلاء الفجوات)
| Agent | Status | File |
|-------|--------|------|
| Gap Hunter | ✅ Documented | `docs/pkg5/gap_hunter_agent.yaml` |
| Blind Spot Detector | 📋 Planned | - |
| Opportunity Spotter | 📋 Planned | - |

### 7. Specialized Agents (وكلاء متخصصون)
| Agent | Status | Source |
|-------|--------|--------|
| Purification Family | ✅ Documented | pkg7 |
| Observatory | ✅ Documented | pkg8 |
| Model Router | ✅ Documented | pkg8 |
| Shura Protocol | ✅ Documented | pkg8 |
| Zotero Agent | ✅ Documented | pkg9 |
| Smart Notebook | ✅ Documented | pkg9 |
| Methodology Agent | ✅ Documented | pkg10 |
| Academic Support | ✅ Documented | pkg10 |
| Academic Companion | ✅ Documented | pkg10 |
| Agent Manager | ✅ Documented | pkg11 |

---

## 44 Atomic Operations (Implemented)

### Extract (E1-E6)
| ID | Name | Status | Integrated |
|----|------|--------|------------|
| E1 | Text Search | ✅ | BigQuery |
| E2 | Semantic Search | ✅ | BigQuery + Vertex |
| E3 | Entity Extraction | ✅ | Skeleton |
| E4 | Relation Extraction | ✅ | Skeleton |
| E5 | Citation Extraction | ✅ | Skeleton |
| E6 | Term Extraction | ✅ | Skeleton |

### Link (L1-L5)
| ID | Name | Status | Integrated |
|----|------|--------|------------|
| L1 | Entity Resolution | ✅ | Vertex AI |
| L2 | Concept Linking | ✅ | Vertex AI |
| L3 | Citation Linking | ✅ | Skeleton |
| L4 | Intertextual Linking | ✅ | Skeleton |
| L5 | Genealogical Linking | ✅ | Skeleton |

### Trace (T1-T5)
| ID | Name | Status |
|----|------|--------|
| T1 | Lexical Tracing | ✅ Skeleton |
| T2 | Conceptual Tracing | ✅ Skeleton |
| T3 | Genealogical Tracing | ✅ Skeleton |
| T4 | Geographic Tracing | ✅ Skeleton |
| T5 | Institutional Tracing | ✅ Skeleton |

### Analyze (A1-A6)
| ID | Name | Status | Integrated |
|----|------|--------|------------|
| A1 | Argument Analysis | ✅ | Vertex AI |
| A2 | Context Analysis | ✅ | Skeleton |
| A3 | Comparative Analysis | ✅ | Skeleton |
| A4 | Contradiction Analysis | ✅ | Skeleton |
| A5 | Gap Analysis | ✅ | BigQuery + Vertex |
| A6 | Position Analysis | ✅ | Skeleton |

### Construct (C1-C6)
| ID | Name | Status |
|----|------|--------|
| C1 | Evidence Bundle | ✅ Skeleton |
| C2 | Claim Construction | ✅ Skeleton |
| C3 | Counter Evidence | ✅ Skeleton |
| C4 | Outline Construction | ✅ Skeleton |
| C5 | Glossary Construction | ✅ Skeleton |
| C6 | Ontology Construction | ✅ Skeleton |

### Synthesize (S1-S5)
| ID | Name | Status |
|----|------|--------|
| S1 | Narrative Synthesis | ✅ Skeleton |
| S2 | Report Synthesis | ✅ Skeleton |
| S3 | Knowledge Map | ✅ Skeleton |
| S4 | Timeline Synthesis | ✅ Skeleton |
| S5 | Comparative Synthesis | ✅ Skeleton |

### Write (W1-W5)
| ID | Name | Status |
|----|------|--------|
| W1 | Documented Paragraph | ✅ Skeleton |
| W2 | Section Writing | ✅ Skeleton |
| W3 | Abstract Writing | ✅ Skeleton |
| W4 | Critical Review | ✅ Skeleton |
| W5 | Intro Conclusion | ✅ Skeleton |

### Verify (V1-V6) - Quality Gates
| ID | Name | Mandatory | Status |
|----|------|-----------|--------|
| V1 | Citation Audit | ✅ YES | BigQuery |
| V2 | Consistency Audit | ✅ YES | Skeleton |
| V3 | Coverage Audit | ❌ | Skeleton |
| V4 | Provenance Audit | ✅ YES | Skeleton |
| V5 | Rights Audit | ❌ | Skeleton |
| V6 | Schema Testing | ❌ | Skeleton |

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Implemented |
| 📋 | Planned/Documented |
| ⬜ | Not Started |
| 🔶 | Partial |

---

*Last Updated: 2025-12-21*
