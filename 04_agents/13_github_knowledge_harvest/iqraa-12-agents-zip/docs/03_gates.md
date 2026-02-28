# Quality Gates

## IQRA System v1.3 - 6 Gates

---

## Gate Overview

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  G-0    │───▶│  G-1    │───▶│  G-2    │───▶│  G-3    │───▶│  G-4    │───▶│  G-5    │
│ Accept  │    │Evidence │    │ Falsify │    │ Purify  │    │ Ground  │    │ Export  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
```

---

## G-0: Acceptance Gate (بوابة القبول)

**Purpose:** Validate and classify incoming queries.

**Checks:**
| Check | Description | Threshold |
|-------|-------------|-----------|
| Language | Valid Arabic/English | Required |
| Scope | Within IQRA domains | Required |
| Safety | No harmful content | Required |
| Clarity | Parseable query | Required |

**Actions:**
- ✅ Pass → Route to Orchestrator
- ❌ Fail → Return with clarification request
- ⚠️ Warn → Flag for human review

**Timeout:** 5 seconds

---

## G-1: Evidence Gate (بوابة الدليل)

**Purpose:** Ensure every claim has verifiable evidence.

**Checks:**
| Check | Description | Threshold |
|-------|-------------|-----------|
| Citation | Valid FRBR reference | Required |
| Source | Accessible source | Required |
| Accuracy | Quote matches original | > 95% |
| Coverage | Claims with evidence | > 90% |

**Actions:**
- ✅ Pass → Continue to G-2
- ❌ Fail → Return to Evidencer
- ⚠️ Warn → Flag low confidence

**Timeout:** 30 seconds

---

## G-2: Falsification Gate (بوابة التكذيب)

**Purpose:** Attempt to disprove claims before accepting them.

**Checks:**
| Check | Description | Threshold |
|-------|-------------|-----------|
| Counter-evidence | Searched for | Required |
| Alternative views | Considered | Required |
| Logical consistency | No contradictions | Required |
| Scholarly consensus | Alignment checked | Informational |

**Actions:**
- ✅ Pass → Continue to G-3
- ❌ Fail → Reject or revise claim
- ⚠️ Warn → Flag for scholarly review

**Escalation:** Automatic HITL for religious topics (عقيدة/فقه/حكم شرعي)

**Timeout:** 60 seconds

---

## G-3: Purification Gate (بوابة التطهير)

**Purpose:** Validate external methods and ensure epistemological alignment.

**Checks:**
| Check | Description | Threshold |
|-------|-------------|-----------|
| Method origin | Documented | Required |
| Epistemological fit | Compatible with Islamic scholarship | Required |
| Adaptation | Necessary modifications made | Required |
| Validation | Tested in Islamic context | Required |

**Actions:**
- ✅ Pass → Continue to G-4
- ❌ Fail → Return to Purifier
- ⚠️ Warn → Flag for methodology expert

**Escalation:** HITL for external method adoption

**Timeout:** 90 seconds

---

## G-4: Grounding Gate (بوابة التأصيل)

**Purpose:** Ensure theories are properly grounded in evidence and tradition.

**Checks:**
| Check | Description | Threshold |
|-------|-------------|-----------|
| Evidence chain | Complete and valid | Required |
| Reasoning | Logically sound | Required |
| Tradition alignment | Not contradicting established principles | Required |
| Novelty justification | If novel, properly explained | Required |

**Actions:**
- ✅ Pass → Continue to G-5
- ❌ Fail → Return to Theorist
- ⚠️ Warn → Flag for senior review

**Timeout:** 120 seconds

---

## G-5: Export Gate (بوابة التصدير)

**Purpose:** Final quality check before delivering output.

**Checks:**
| Check | Description | Threshold |
|-------|-------------|-----------|
| Completeness | All required fields present | Required |
| Format | Matches output contract | Required |
| Confidence | Meets minimum threshold | > 0.7 |
| Cost | Within budget | Required |
| Audit trail | Complete trace | Required |

**Actions:**
- ✅ Pass → Deliver to user
- ❌ Fail → Return for revision
- ⚠️ Warn → Deliver with caveats

**HITL:** Always required for:
- Confidence < 0.7
- Sensitive topics
- First-time patterns

**Timeout:** 30 seconds

---

## Gate Event Schema

```python
@dataclass
class GateEvent:
    event_id: str           # Unique identifier
    run_id: str             # Parent run
    gate_id: str            # G-0 to G-5
    agent_id: str           # Which agent's output
    timestamp: datetime     # When checked
    input_hash: str         # Hash of input
    checks_performed: list  # List of checks
    checks_passed: int      # Count passed
    checks_failed: int      # Count failed
    result: str             # pass/fail/warn
    details: dict           # Check details
    latency_ms: int         # Processing time
    next_action: str        # What happens next
```

---

## Gate Configuration

```yaml
gates:
  g0_acceptance:
    enabled: true
    timeout_seconds: 5
    checks:
      - language_valid
      - scope_valid
      - safety_check
      - clarity_check
    
  g1_evidence:
    enabled: true
    timeout_seconds: 30
    min_confidence: 0.7
    checks:
      - citation_valid
      - source_accessible
      - quote_accuracy
      - coverage_threshold
    
  g2_falsification:
    enabled: true
    timeout_seconds: 60
    hitl_topics:
      - عقيدة
      - فقه
      - حكم شرعي
    checks:
      - counter_evidence
      - alternative_views
      - logical_consistency
    
  g3_purification:
    enabled: true
    timeout_seconds: 90
    require_hitl_for_external: true
    checks:
      - method_origin
      - epistemological_fit
      - adaptation_complete
      - validation_done
    
  g4_grounding:
    enabled: true
    timeout_seconds: 120
    checks:
      - evidence_chain
      - reasoning_valid
      - tradition_aligned
      - novelty_justified
    
  g5_export:
    enabled: true
    timeout_seconds: 30
    min_confidence: 0.7
    require_audit_trail: true
    checks:
      - completeness
      - format_valid
      - confidence_met
      - cost_within_budget
      - audit_complete
```

---

## Gate Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| pass_rate | % of items passing | < 80% |
| avg_latency | Average gate processing time | > 2x timeout |
| hitl_rate | % requiring human review | > 30% |
| retry_rate | % retried after failure | > 20% |
| error_rate | % with gate errors | > 5% |

---

**Document Version:** 1.3  
**Last Updated:** January 2026  
**Status:** FINAL - Source of Truth
