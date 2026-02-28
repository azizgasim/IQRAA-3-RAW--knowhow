"""
L1: Entity Resolution - تسوية الكيانات
ربط الكيانات المتشابهة وتوحيدها
"""
from typing import ClassVar, Any, Optional
from ...models.enums import OperationCategory, AutonomyLevel
from ...models.schemas import OperationInput, OperationOutput
from ...core.base import BaseOperation, OperationRegistry
from ...infrastructure.bigquery_client import BigQueryClient
from ...infrastructure.vertex_client import VertexAIClient
from ...infrastructure.config import Config


@OperationRegistry.register
class L1_EntityResolution(BaseOperation):
    """
    تسوية الكيانات - ربط الأسماء المختلفة للكيان الواحد
    
    المدخلات:
        - entities: قائمة الكيانات المستخرجة
        - similarity_threshold: حد التشابه (افتراضي 0.85)
        
    المخرجات:
        - resolved_entities: الكيانات الموحدة
        - merge_suggestions: اقتراحات الدمج
    """
    
    operation_id: ClassVar[str] = "L1"
    name: ClassVar[str] = "Entity Resolution"
    name_ar: ClassVar[str] = "تسوية الكيانات"
    category: ClassVar[OperationCategory] = OperationCategory.LINK
    autonomy_level: ClassVar[AutonomyLevel] = AutonomyLevel.L1
    purpose: ClassVar[str] = "Resolve and unify similar entities"
    purpose_ar: ClassVar[str] = "توحيد الكيانات المتشابهة"
    cost_estimate_usd: ClassVar[float] = 0.01
    
    def __init__(self):
        super().__init__()
        self.config = Config.from_env()
        self.bq_client = BigQueryClient(self.config)
        self.vertex_client = VertexAIClient(self.config)
    
    async def _compute_similarity(self, entity1: str, entity2: str) -> float:
        """حساب التشابه بين كيانين"""
        try:
            emb1 = await self.vertex_client.get_embedding(entity1)
            emb2 = await self.vertex_client.get_embedding(entity2)
            
            # Cosine similarity
            dot_product = sum(a * b for a, b in zip(emb1, emb2))
            norm1 = sum(a * a for a in emb1) ** 0.5
            norm2 = sum(b * b for b in emb2) ** 0.5
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
            return dot_product / (norm1 * norm2)
        except Exception:
            return 0.0
    
    async def _execute(self, input_data: OperationInput) -> OperationOutput:
        entities = input_data.parameters.get("entities", [])
        threshold = input_data.parameters.get("similarity_threshold", 0.85)
        
        if not entities:
            return OperationOutput(
                operation_id=self.operation_id,
                success=True,
                result={"resolved_entities": [], "merge_suggestions": []},
                metadata={"input_count": 0}
            )
        
        resolved = []
        suggestions = []
        processed = set()
        
        for i, entity in enumerate(entities):
            if entity in processed:
                continue
                
            cluster = [entity]
            processed.add(entity)
            
            for j, other in enumerate(entities[i+1:], i+1):
                if other in processed:
                    continue
                    
                similarity = await self._compute_similarity(entity, other)
                
                if similarity >= threshold:
                    cluster.append(other)
                    processed.add(other)
                    suggestions.append({
                        "entity1": entity,
                        "entity2": other,
                        "similarity": similarity,
                        "action": "merge"
                    })
            
            resolved.append({
                "canonical": entity,
                "variants": cluster,
                "count": len(cluster)
            })
        
        return OperationOutput(
            operation_id=self.operation_id,
            success=True,
            result={
                "resolved_entities": resolved,
                "merge_suggestions": suggestions
            },
            metadata={
                "input_count": len(entities),
                "output_count": len(resolved),
                "threshold": threshold
            }
        )
