"""
IQRA-12 Configuration
إعدادات المنظومة
"""
import os
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Config:
    """Central configuration for IQRA-12"""
    
    # GCP Settings
    project_id: str = "iqraa-12"
    location: str = "US"
    
    # Datasets
    unified_dataset: str = "iqra_unified"
    ops_dataset: str = "ops"
    evidence_dataset: str = "evidence"
    diwan_dataset: str = "diwan_iqraa_elmi"
    acquisition_dataset: str = "dh_acquisition"
    
    # Tables
    passages_table: str = "passages"
    runs_table: str = "runs"
    recipes_table: str = "recipes"
    
    # Limits
    default_query_limit: int = 100
    max_query_limit: int = 10000
    default_cost_budget_usd: float = 1.0
    max_cost_budget_usd: float = 100.0
    
    # LLM Settings
    default_model: str = "gemini-1.5-pro"
    temperature: float = 0.3
    max_tokens: int = 4000
    
    # Feature Flags
    enable_vector_search: bool = False
    enable_counter_evidence: bool = True
    require_v4_for_publish: bool = True
    
    @classmethod
    def from_env(cls) -> "Config":
        """Load configuration from environment variables"""
        return cls(
            project_id=os.getenv("GCP_PROJECT_ID", "iqraa-12"),
            location=os.getenv("GCP_LOCATION", "US"),
            default_model=os.getenv("DEFAULT_LLM_MODEL", "gemini-1.5-pro"),
            enable_vector_search=os.getenv("ENABLE_VECTOR_SEARCH", "false").lower() == "true",
        )
