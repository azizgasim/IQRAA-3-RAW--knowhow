"""
E2: Semantic Search - البحث الدلالي
"""
from typing import ClassVar, Any, Optional

from ...models.enums import OperationCategory, AutonomyLevel
from ...models.schemas import OperationInput, OperationOutput
from ...core.base import BaseOperation, OperationRegistry
from ...infrastructure.bigquery_client import BigQueryClient
from ...infrastructure.config import Config


@OperationRegistry.register
class E2_SemanticSearch(BaseOperation):
    """
    البحث الدلالي باستخدام المتجهات
    
    المدخلات:
        - query: نص الاستعلام (سيتم تحويله لمتجه)
        - embedding: المتجه مباشرة (اختياري)
        - corpus_scope: نطاق الكوربس
        - limit: عدد النتائج
        - min_similarity: الحد الأدنى للتشابه
        
    المخرجات:
        - passages: قائمة المقاطع مرتبة بالتشابه
        - similarity_scores: درجات التشابه
    """
    
    operation_id: ClassVar[str] = "E2"
    name: ClassVar[str] = "Semantic Search"
    name_ar: ClassVar[str] = "البحث الدلالي"
    category: ClassVar[OperationCategory] = OperationCategory.EXTRACT
    autonomy_level: ClassVar[AutonomyLevel] = AutonomyLevel.L0
    purpose: ClassVar[str] = "Semantic similarity search using embeddings"
    purpose_ar: ClassVar[str] = "البحث بالتشابه الدلالي باستخدام المتجهات"
    cost_estimate_usd: ClassVar[float] = 0.005
    
    def __init__(self):
        super().__init__()
        self.config = Config.from_env()
        self.bq_client = BigQueryClient(self.config)
    
    async def _get_embedding(self, text: str) -> list[float]:
        """تحويل النص إلى متجه - يحتاج Vertex AI"""
        # TODO: Integrate with Vertex AI Embeddings
        # For now, return placeholder
        return [0.0] * 768
    
    async def _execute(self, input_data: OperationInput) -> OperationOutput:
        """تنفيذ البحث الدلالي"""
        
        query = input_data.parameters.get("query", "")
        embedding = input_data.parameters.get("embedding")
        corpus_scope = input_data.parameters.get("corpus_scope")
        limit = input_data.parameters.get("limit", 100)
        min_similarity = input_data.parameters.get("min_similarity", 0.7)
        
        if not query and not embedding:
            return OperationOutput(
                operation_id=self.operation_id,
                success=False,
                error_message="Either query or embedding is required",
                result={},
                metadata={}
            )
        
        try:
            # Get embedding if not provided
            if not embedding:
                embedding = await self._get_embedding(query)
            
            # Execute search
            passages = await self.bq_client.search_passages_semantic(
                embedding=embedding,
                corpus_scope=corpus_scope,
                limit=limit,
                min_similarity=min_similarity,
            )
            
            return OperationOutput(
                operation_id=self.operation_id,
                success=True,
                result={
                    "passages": passages,
                    "total_found": len(passages),
                    "query": query,
                },
                metadata={
                    "embedding_dim": len(embedding),
                    "min_similarity": min_similarity,
                }
            )
            
        except Exception as e:
            self.logger.error("semantic_search_failed", error=str(e))
            return OperationOutput(
                operation_id=self.operation_id,
                success=False,
                error_message=str(e),
                result={},
                metadata={}
            )
