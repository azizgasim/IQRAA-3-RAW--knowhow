"""
IQRA System Configuration v1.3
===============================
Central configuration for all components.
"""

import os
from dataclasses import dataclass, field
from typing import Dict, Any, Optional

# Environment
ENV = os.getenv("IQRA_ENV", "development")
DEBUG = os.getenv("IQRA_DEBUG", "true").lower() == "true"

# Google Cloud
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID", "iqra-system")
GCP_REGION = os.getenv("GCP_REGION", "me-central1")  # Dammam

# BigQuery
BQ_DATASET_OPS = os.getenv("BQ_DATASET_OPS", "iqra_ops_logs")
BQ_DATASET_KB = os.getenv("BQ_DATASET_KB", "iqra_kb_store")

# LLM Configuration
LLM_DEFAULT_MODEL = os.getenv("LLM_MODEL", "gemini-1.5-pro")
LLM_DEFAULT_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.3"))
LLM_MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "8192"))

# RAG Configuration
RAG_EMBEDDING_MODEL = "text-multilingual-embedding-002"
RAG_CHUNK_SIZE = 512
RAG_CHUNK_OVERLAP = 50
RAG_RETRIEVAL_TOP_K = 20
RAG_MIN_SCORE = 0.7
RAG_RERANK_TOP_K = 10
RAG_MAX_CONTEXT_TOKENS = 8000

# Gate Thresholds
GATE_THRESHOLDS = {
    "G-0": {"morphological_completeness": 0.95, "diacritization_accuracy": 0.90, "ner_coverage": 0.85},
    "G-1": {"frbr_chain_complete": 1.0, "quote_accuracy": 0.98, "page_reference_valid": 1.0, "source_authority": 0.80},
    "G-2": {"definition_sourced": 1.0, "semantic_consistency": 0.90, "term_normalized": 1.0},
    "G-3": {"temporal_consistency": 1.0, "influence_evidenced": 0.85, "no_circular_links": 1.0},
    "G-4": {"hypothesis_clear": 0.90, "evidence_sufficient": 1.0, "counterarguments_addressed": 0.80},
    "G-5": {"no_hallucination": 1.0, "bias_check": 0.90, "completeness": 0.85, "citation_format": 1.0},
}

# Human-in-the-Loop Configuration
HITL_CONFIG = {
    "confidence_threshold_L1": 0.7,  # Standard review
    "confidence_threshold_L2": 0.5,  # Senior review
    "confidence_threshold_L3": 0.3,  # Expert review
    "auto_approve_threshold": 0.95,
    "max_review_queue_size": 100,
    "review_timeout_hours": 48,
}

# Error Learning Configuration
ERROR_LEARNING_CONFIG = {
    "pattern_detection_threshold": 10,  # Min errors for pattern
    "scheduled_analysis_hours": 24,
    "max_proposals_per_cycle": 5,
    "auto_implement_threshold": 0.9,
}

# Agent Configurations
AGENT_CONFIGS = {
    "AGT-01-LINGUIST": {
        "model": "gemini-1.5-pro",
        "temperature": 0.1,
        "timeout": 60,
        "autonomy": "L2_ADVISOR",
    },
    "AGT-02-ORCHESTRATOR": {
        "model": "gemini-1.5-pro",
        "temperature": 0.3,
        "timeout": 30,
        "autonomy": "L3_DECIDER",
    },
    "AGT-03-GUARDIAN": {
        "model": "gemini-1.5-pro",
        "temperature": 0.2,
        "timeout": 30,
        "autonomy": "L3_DECIDER",
    },
    "AGT-04-ARCHIVIST": {
        "model": "gemini-1.5-flash",
        "temperature": 0.1,
        "timeout": 30,
        "autonomy": "L1_EXECUTOR",
    },
    "AGT-05-EVIDENCER": {
        "model": "gemini-1.5-pro",
        "temperature": 0.2,
        "timeout": 90,
        "autonomy": "L2_ADVISOR",
    },
    "AGT-06-ANALYST": {
        "model": "gemini-1.5-pro",
        "temperature": 0.4,
        "timeout": 90,
        "autonomy": "L2_ADVISOR",
    },
    "AGT-07-GENEALOGIST": {
        "model": "gemini-1.5-pro",
        "temperature": 0.5,
        "timeout": 120,
        "autonomy": "L2_ADVISOR",
    },
    "AGT-08-SCOUT": {
        "model": "gemini-1.5-pro",
        "temperature": 0.7,
        "timeout": 120,
        "autonomy": "L4_INITIATOR",
    },
    "AGT-09-THEORIST": {
        "model": "gemini-1.5-pro",
        "temperature": 0.6,
        "timeout": 180,
        "autonomy": "L3_DECIDER",
    },
    "AGT-10-PURIFIER": {
        "model": "gemini-1.5-pro",
        "temperature": 0.3,
        "timeout": 120,
        "autonomy": "L3_DECIDER",
    },
    "AGT-11-IMPROVER": {
        "model": "gemini-1.5-pro",
        "temperature": 0.4,
        "timeout": 180,
        "autonomy": "L3_DECIDER",
    },
}

# Playbook Definitions
PLAYBOOKS = {
    "PB-01": {"name": "Evidence Retrieval", "agents": ["AGT-01", "AGT-05", "AGT-03"], "gates": ["G-0", "G-1", "G-5"]},
    "PB-02": {"name": "Concept Analysis", "agents": ["AGT-01", "AGT-05", "AGT-06", "AGT-03"], "gates": ["G-0", "G-1", "G-2", "G-5"]},
    "PB-03": {"name": "Genealogy Trace", "agents": ["AGT-01", "AGT-05", "AGT-07", "AGT-03"], "gates": ["G-0", "G-1", "G-3", "G-5"]},
    "PB-04": {"name": "Comparison", "agents": ["AGT-01", "AGT-05", "AGT-06", "AGT-03"], "gates": ["G-0", "G-1", "G-2", "G-5"]},
    "PB-05": {"name": "Falsification", "agents": ["AGT-01", "AGT-05", "AGT-10", "AGT-03"], "gates": ["G-0", "G-1", "G-5"]},
    "PB-06": {"name": "Purification", "agents": ["AGT-01", "AGT-10", "AGT-03"], "gates": ["G-0", "G-5"]},
    "PB-07": {"name": "Theory Building", "agents": ["AGT-01", "AGT-05", "AGT-06", "AGT-09", "AGT-10", "AGT-03"], "gates": ["G-0", "G-1", "G-2", "G-4", "G-5"]},
    "PB-08": {"name": "Spark Generation", "agents": ["AGT-01", "AGT-08", "AGT-03"], "gates": ["G-0", "G-5"]},
    "PB-09": {"name": "Context Retrieval", "agents": ["AGT-01", "AGT-04", "AGT-03"], "gates": ["G-0", "G-5"]},
    "PB-10": {"name": "Export", "agents": ["AGT-03"], "gates": ["G-5"]},
    "PB-11": {"name": "Memory Management", "agents": ["AGT-04"], "gates": []},
    "PB-12": {"name": "Self-Improvement", "agents": ["AGT-11", "AGT-03"], "gates": ["G-5"]},
}

# Logging Configuration
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
        },
        "json": {
            "format": '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}'
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
            "level": "DEBUG" if DEBUG else "INFO",
        },
    },
    "loggers": {
        "iqra": {
            "handlers": ["console"],
            "level": "DEBUG" if DEBUG else "INFO",
            "propagate": False,
        },
    },
}


@dataclass
class SystemConfig:
    """Complete system configuration."""
    env: str = ENV
    debug: bool = DEBUG
    gcp_project: str = GCP_PROJECT_ID
    gcp_region: str = GCP_REGION
    agents: Dict[str, Any] = field(default_factory=lambda: AGENT_CONFIGS)
    gates: Dict[str, Any] = field(default_factory=lambda: GATE_THRESHOLDS)
    playbooks: Dict[str, Any] = field(default_factory=lambda: PLAYBOOKS)
    hitl: Dict[str, Any] = field(default_factory=lambda: HITL_CONFIG)
    error_learning: Dict[str, Any] = field(default_factory=lambda: ERROR_LEARNING_CONFIG)


# Global config instance
config = SystemConfig()
