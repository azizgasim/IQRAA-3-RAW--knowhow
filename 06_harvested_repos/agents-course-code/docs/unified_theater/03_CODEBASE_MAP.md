# IQRA-12 Codebase Map
## خريطة قاعدة الكود

---

## Repository

| Field | Value |
|-------|-------|
| URL | https://github.com/Azizgasiim/agents-course-code |
| Language | Python 3.11+ |
| Framework | Pydantic, asyncio |
| Cloud | Google Cloud Platform |

---

## Directory Structure

```
agents-course-code/
│
├── 📁 src/iqra12/                    # Main Python Package
│   ├── __init__.py
│   │
│   ├── 📁 core/                      # Core Classes
│   │   ├── __init__.py
│   │   ├── base.py                   # BaseOperation, OperationRegistry
│   │   └── exceptions.py             # Custom Exceptions
│   │
│   ├── 📁 models/                    # Pydantic Models
│   │   ├── __init__.py
│   │   ├── enums.py                  # AutonomyLevel, OperationCategory
│   │   └── schemas.py                # OperationInput, OperationOutput
│   │
│   ├── 📁 infrastructure/            # Infrastructure Layer
│   │   ├── __init__.py
│   │   ├── config.py                 # Config class
│   │   ├── bigquery_client.py        # BigQueryClient
│   │   └── vertex_client.py          # VertexAIClient
│   │
│   └── 📁 operations/                # 44 Atomic Operations
│       ├── __init__.py
│       ├── 📁 extract/               # E1-E6
│       ├── 📁 link/                  # L1-L5
│       ├── 📁 trace/                 # T1-T5
│       ├── 📁 analyze/               # A1-A6
│       ├── 📁 construct/             # C1-C6
│       ├── 📁 synthesize/            # S1-S5
│       ├── 📁 write/                 # W1-W5
│       └── 📁 verify/                # V1-V6
│
├── 📁 sql/migrations/                # SQL Migration Files
│   ├── 001_create_unified_schema.sql
│   ├── 002_create_passages_view.sql
│   ├── 003_create_ops_schema.sql
│   └── 004_create_evidence_tables.sql
│
├── 📁 scripts/                       # Utility Scripts
│   ├── run_migrations.py
│   └── test_connection.py
│
├── 📁 docs/                          # Documentation
│   ├── 📁 unified_theater/           # Shared Knowledge Base
│   │   ├── 01_BIGQUERY_MAP.md
│   │   ├── 02_AGENTS_REGISTRY.md
│   │   └── 03_CODEBASE_MAP.md
│   ├── 📁 pkg7_purification/
│   ├── 📁 pkg8_advisors/
│   ├── 📁 pkg9_tools/
│   ├── 📁 pkg10_research_support/
│   └── 📁 pkg11_agent_manager/
│
├── 📁 iqra12_*/                      # YAML Documentation Packages
│   ├── iqra12_knowledge_layer/
│   ├── iqra12_operations_contracts/
│   ├── iqra12_composition_engine/
│   ├── iqra12_agents_layer/
│   └── iqra12_gap_hunter_agent/
│
├── pyproject.toml                    # Project Configuration
├── QUICKSTART.md                     # Quick Start Guide
└── IQRA12_STATUS_REPORT.md          # Status Report
```

---

## Key Classes

### BaseOperation (core/base.py)
```python
class BaseOperation(ABC):
    operation_id: ClassVar[str]
    name: ClassVar[str]
    name_ar: ClassVar[str]
    category: ClassVar[OperationCategory]
    autonomy_level: ClassVar[AutonomyLevel]
    
    async def execute(self, input_data: OperationInput) -> OperationOutput
    async def _execute(self, input_data: OperationInput) -> OperationOutput  # Abstract
```

### OperationRegistry (core/base.py)
```python
class OperationRegistry:
    @classmethod
    def register(cls, operation_class)  # Decorator
    @classmethod
    def get(cls, operation_id: str)
    @classmethod
    def get_all(cls) -> dict
    @classmethod
    def get_by_category(cls, category)
```

### BigQueryClient (infrastructure/bigquery_client.py)
```python
class BigQueryClient:
    async def search_passages_text(query, corpus_scope, limit)
    async def create_run(project_id, recipe_id, ...)
    async def update_run_status(run_id, status, ...)
    async def create_evidence_bundle(run_id, project_id, query)
    async def add_evidence_item(bundle_id, passage_id, offsets, ...)
```

### VertexAIClient (infrastructure/vertex_client.py)
```python
class VertexAIClient:
    async def get_embedding(text) -> list[float]
    async def get_embeddings_batch(texts) -> list[list[float]]
    async def generate_text(prompt, temperature, max_tokens)
    async def analyze_text(text, task, output_format)
```

---

## Enums

### AutonomyLevel
| Level | Name | Description |
|-------|------|-------------|
| L0 | Read Only | قراءة فقط |
| L1 | Suggest | اقتراح |
| L2 | Supervised Execute | تنفيذ مراقب |
| L3 | Conditional Execute | تنفيذ مشروط |
| L4 | Limited Autopilot | طيار محدود |

### OperationCategory
| Code | Name |
|------|------|
| E | EXTRACT |
| L | LINK |
| T | TRACE |
| A | ANALYZE |
| C | CONSTRUCT |
| S | SYNTHESIZE |
| W | WRITE |
| V | VERIFY |

---

## File Count

| Type | Count |
|------|-------|
| Python (.py) | 60+ |
| YAML (.yaml) | 41 |
| SQL (.sql) | 4 |
| Markdown (.md) | 5+ |

---

## Dependencies

```toml
[project.dependencies]
pydantic = ">=2.0"
google-cloud-bigquery = ">=3.0"
google-cloud-aiplatform = ">=1.40"
langchain = ">=0.1.0"
langchain-google-genai = ">=1.0"
redis = ">=5.0"
structlog = ">=24.0"
tenacity = ">=8.0"
```

---

*Last Updated: 2025-12-21*
