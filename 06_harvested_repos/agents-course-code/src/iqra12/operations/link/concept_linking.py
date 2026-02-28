"""
L2: Concept Linking - ربط المفاهيم
"""
from typing import ClassVar
from ...models.enums import OperationCategory, AutonomyLevel
from ...models.schemas import OperationInput, OperationOutput
from ...core.base import BaseOperation, OperationRegistry
from ...infrastructure.bigquery_client import BigQueryClient
from ...infrastructure.vertex_client import VertexAIClient
from ...infrastructure.config import Config


@OperationRegistry.register
class L2_ConceptLinking(BaseOperation):
    """ربط المفاهيم بالأنطولوجيا"""
    
    operation_id: ClassVar[str] = "L2"
    name: ClassVar[str] = "Concept Linking"
    name_ar: ClassVar[str] = "ربط المفاهيم"
    category: ClassVar[OperationCategory] = OperationCategory.LINK
    autonomy_level: ClassVar[AutonomyLevel] = AutonomyLevel.L1
    purpose: ClassVar[str] = "Link concepts to ontology"
    purpose_ar: ClassVar[str] = "ربط المفاهيم بالأنطولوجيا"
    cost_estimate_usd: ClassVar[float] = 0.01
    
    def __init__(self):
        super().__init__()
        self.config = Config.from_env()
        self.bq_client = BigQueryClient(self.config)
        self.vertex_client = VertexAIClient(self.config)
    
    async def _execute(self, input_data: OperationInput) -> OperationOutput:
        concepts = input_data.parameters.get("concepts", [])
        
        linked = []
        for concept in concepts:
            # Get concept analysis from LLM
            analysis = await self.vertex_client.analyze_text(
                text=concept,
                task="تحليل المفهوم وتحديد الفئة والمفاهيم المرتبطة",
                output_format="json"
            )
            
            linked.append({
                "concept": concept,
                "ontology_uri": f"iqra:concept/{hash(concept) % 10000}",
                "category": analysis.get("category", "unknown"),
                "related_concepts": analysis.get("related", []),
                "definition": analysis.get("definition", "")
            })
        
        return OperationOutput(
            operation_id=self.operation_id,
            success=True,
            result={"concept_links": linked},
            metadata={"linked_count": len(linked)}
        )
