# Agent Contracts

## IQRA System v1.3 - 11 Agents

---

## Agent Overview

| # | Agent | Arabic | Layer | Autonomy | LLM |
|---|-------|--------|-------|----------|-----|
| 1 | Linguist | اللغوي | Pre-processing (L0) | L2 | Gemini 1.5 Pro |
| 2 | Orchestrator | المنسق | Governance (L1) | L3 | Gemini 1.5 Pro |
| 3 | Guardian | الحارس | Governance (L1) | L2 | Gemini 1.5 Flash |
| 4 | Archivist | الخازن | Understanding (L2) | L1 | None |
| 5 | Evidencer | المحقق | Understanding (L2) | L2 | Gemini 1.5 Pro |
| 6 | Analyst | المُحلِّل | Understanding (L2) | L3 | Gemini 1.5 Pro |
| 7 | Genealogist | الجينيالوجي | Exploration (L3) | L3 | Gemini 1.5 Pro |
| 8 | Scout | الرصّاد | Exploration (L3) | L4 | Gemini 1.5 Pro (2M) |
| 9 | Theorist | المُنظِّر | Building (L4) | L4 | Gemini 1.5 Pro |
| 10 | Purifier | المُطهِّر | Building (L4) | L3 | Gemini 1.5 Pro |
| 11 | Improver | المُحسِّن | Meta-Governance (L5) | L3 | Gemini 1.5 Pro |

---

## Autonomy Levels

| Level | Name | Description |
|-------|------|-------------|
| L1 | Executor | Follows instructions exactly, no decisions |
| L2 | Advisor | Suggests options, human/orchestrator decides |
| L3 | Decider | Makes decisions within defined scope |
| L4 | Initiator | Can propose new directions |

---

## Layer 0: Pre-processing

### Agent 1: Linguist (اللغوي)

```yaml
agent_id: AGT-01-LINGUIST
arabic_name: اللغوي
layer: Pre-processing (Layer 0)
autonomy_level: L2 (Advisor)
llm_model: gemini-1.5-pro
temperature: 0.1
timeout_seconds: 60
```

**Responsibilities:**
- Morphological Analysis (التحليل الصرفي)
- Syntactic Parsing (التحليل النحوي)
- Semantic Disambiguation (رفع الإبهام الدلالي)
- Diacritization (التشكيل)
- Named Entity Recognition (الكيانات المسماة)
- Historical manuscript processing

**External Tools:**
| Tool | Source | Capabilities | License |
|------|--------|--------------|---------|
| CAMeL Tools | NYU Abu Dhabi | Morphology, NER, Sentiment | MIT |
| Farasa | QCRI | Segmentation, POS, Diacritization | GPL-3.0 |
| AraBERT | Hugging Face | Embeddings, Classification | Apache 2.0 |
| Qalsadi | Taha Zerrouki | Stemming, Lemmatization | GPL |

**Input:** Raw Arabic text
**Output:** `LinguisticAnalysis` with morphology, syntax, entities

---

## Layer 1: Governance

### Agent 2: Orchestrator (المنسق)

```yaml
agent_id: AGT-02-ORCHESTRATOR
arabic_name: المنسق
layer: Governance (Layer 1)
autonomy_level: L3 (Decider)
llm_model: gemini-1.5-pro
temperature: 0.3
timeout_seconds: 30
```

**Responsibilities:**
- Query classification and routing
- Task decomposition and planning
- Agent coordination
- State management
- Gate enforcement
- Memory lifecycle management

**Input:** User query + context
**Output:** `ExecutionPlan` with steps and agent assignments

---

### Agent 3: Guardian (الحارس)

```yaml
agent_id: AGT-03-GUARDIAN
arabic_name: الحارس
layer: Governance (Layer 1)
autonomy_level: L2 (Advisor)
llm_model: gemini-1.5-flash
temperature: 0.1
timeout_seconds: 20
```

**Responsibilities:**
- Quality monitoring
- Cost tracking
- Bias detection
- Audit logging
- Export approval
- HITL escalation

**Input:** Agent outputs + metadata
**Output:** `QualityReport` with pass/fail and recommendations

---

## Layer 2: Understanding & Analysis

### Agent 4: Archivist (الخازن)

```yaml
agent_id: AGT-04-ARCHIVIST
arabic_name: الخازن
layer: Understanding (Layer 2)
autonomy_level: L1 (Executor)
llm_model: None
temperature: N/A
timeout_seconds: 30
```

**Responsibilities:**
- BigQuery SSOT management
- Data retrieval and storage
- ops_logs maintenance
- kb_store operations
- Cache coordination
- Memory Bank interface

**Input:** Data queries + operations
**Output:** Query results or confirmation

---

### Agent 5: Evidencer (المحقق)

```yaml
agent_id: AGT-05-EVIDENCER
arabic_name: المحقق
layer: Understanding (Layer 2)
autonomy_level: L2 (Advisor)
llm_model: gemini-1.5-pro
temperature: 0.2
timeout_seconds: 60
```

**Responsibilities:**
- Evidence collection
- Citation creation (FRBR)
- Source verification
- Documentation
- Cross-reference validation

**Input:** Claim or concept
**Output:** `EvidenceUnit` with citations and confidence

---

### Agent 6: Analyst (المُحلِّل)

```yaml
agent_id: AGT-06-ANALYST
arabic_name: المُحلِّل
layer: Understanding (Layer 2)
autonomy_level: L3 (Decider)
llm_model: gemini-1.5-pro
temperature: 0.4
timeout_seconds: 90
```

**Responsibilities:**
- Epistemological analysis
- Argumentation mapping
- Thought model creation
- Logical validation
- Comparative analysis

**Input:** Evidence + claims
**Output:** `AnalysisReport` with reasoning chain

---

## Layer 3: Exploration & Linking

### Agent 7: Genealogist (الجينيالوجي)

```yaml
agent_id: AGT-07-GENEALOGIST
arabic_name: الجينيالوجي
layer: Exploration (Layer 3)
autonomy_level: L3 (Decider)
llm_model: gemini-1.5-pro
temperature: 0.5
timeout_seconds: 120
```

**Responsibilities:**
- Concept history tracing
- Knowledge transfer detection
- Lineage construction
- Hidden context discovery
- Temporal ordering

**Input:** Concept or term
**Output:** `LineageLink` + `ContextUnit`

---

### Agent 8: Scout (الرصّاد)

```yaml
agent_id: AGT-08-SCOUT
arabic_name: الرصّاد
layer: Exploration (Layer 3)
autonomy_level: L4 (Initiator)
llm_model: gemini-1.5-pro-002  # 2M context
temperature: 0.6
timeout_seconds: 180
max_context_tokens: 2000000
```

**Responsibilities:**
- Spark detection (new patterns)
- Gap identification
- Cross-linking opportunities
- Pattern recognition
- Hypothesis generation

**Input:** Large corpus or search space
**Output:** `SparkCard` with discovery and confidence

---

## Layer 4: Building & Evaluation

### Agent 9: Theorist (المُنظِّر)

```yaml
agent_id: AGT-09-THEORIST
arabic_name: المُنظِّر
layer: Building (Layer 4)
autonomy_level: L4 (Initiator)
llm_model: gemini-1.5-pro
temperature: 0.7
timeout_seconds: 180
```

**Responsibilities:**
- Theory formation
- System building
- Philosophical synthesis
- Model construction
- Hypothesis refinement

**Input:** Evidence + analysis + sparks
**Output:** `TheoryCard` with structure and grounding

---

### Agent 10: Purifier (المُطهِّر)

```yaml
agent_id: AGT-10-PURIFIER
arabic_name: المُطهِّر
layer: Building (Layer 4)
autonomy_level: L3 (Decider)
llm_model: gemini-1.5-pro
temperature: 0.3
timeout_seconds: 120
```

**Responsibilities:**
- Method purification
- External method validation
- Grounding verification
- Tool/payload certification
- Epistemological alignment

**Input:** Method or theory
**Output:** `PurificationReport` with status and modifications

---

## Layer 5: Meta-Governance

### Agent 11: Improver (المُحسِّن)

```yaml
agent_id: AGT-11-IMPROVER
arabic_name: المُحسِّن
layer: Meta-Governance (Layer 5)
autonomy_level: L3 (Decider)
llm_model: gemini-1.5-pro
temperature: 0.3
timeout_seconds: 120
```

**Responsibilities:**
- Error pattern analysis
- System improvement proposals
- Playbook updates
- Performance optimization
- Feedback loop management

**Triggers:**
- Scheduled: Every 24 hours
- Threshold: When 10+ errors of same type
- Manual: On admin request

**Input:** Error registry + metrics
**Output:** `ImprovementProposal` + `PatternAlert` + `PlaybookUpdate`

---

## Agent Communication Protocol

All agents communicate through standardized messages:

```python
@dataclass
class AgentMessage:
    message_id: str
    run_id: str
    from_agent: str
    to_agent: str
    message_type: str  # request/response/event/error
    payload: dict
    timestamp: datetime
    correlation_id: str
    trace_id: str
```

---

**Document Version:** 1.3  
**Last Updated:** January 2026  
**Status:** FINAL - Source of Truth
