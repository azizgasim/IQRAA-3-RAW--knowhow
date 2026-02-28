"""
A5: Gap Analysis - تحليل الثغرات
"""
from typing import ClassVar
from ...models.enums import OperationCategory, AutonomyLevel
from ...models.schemas import OperationInput, OperationOutput
from ...core.base import BaseOperation, OperationRegistry
from ...infrastructure.bigquery_client import BigQueryClient
from ...infrastructure.vertex_client import VertexAIClient
from ...infrastructure.config import Config


@OperationRegistry.register
class A5_GapAnalysis(BaseOperation):
    """تحليل الثغرات في التغطية البحثية"""
    
    operation_id: ClassVar[str] = "A5"
    name: ClassVar[str] = "Gap Analysis"
    name_ar: ClassVar[str] = "تحليل الثغرات"
    category: ClassVar[OperationCategory] = OperationCategory.ANALYZE
    autonomy_level: ClassVar[AutonomyLevel] = AutonomyLevel.L1
    purpose: ClassVar[str] = "Identify research gaps"
    purpose_ar: ClassVar[str] = "تحديد الثغرات في التغطية البحثية"
    cost_estimate_usd: ClassVar[float] = 0.03
    
    def __init__(self):
        super().__init__()
        self.config = Config.from_env()
        self.bq_client = BigQueryClient(self.config)
        self.vertex_client = VertexAIClient(self.config)
    
    async def _execute(self, input_data: OperationInput) -> OperationOutput:
        topic = input_data.parameters.get("topic", "")
        evidence_bundle = input_data.parameters.get("evidence_bundle", {})
        expected_aspects = input_data.parameters.get("expected_aspects", [])
        
        # Search for existing coverage
        existing_passages = await self.bq_client.search_passages_text(
            query=topic,
            limit=100
        )
        
        # Analyze gaps using LLM
        prompt = f"""
حلل التغطية البحثية للموضوع التالي:

الموضوع: {topic}

الجوانب المتوقعة: {expected_aspects}

عدد المقاطع الموجودة: {len(existing_passages)}

حدد:
1. الجوانب المغطاة
2. الجوانب الناقصة (الثغرات)
3. توصيات لسد الثغرات

أجب بصيغة JSON.
"""
        
        try:
            response = await self.vertex_client.generate_text(prompt, temperature=0.2)
            
            import json
            try:
                analysis = json.loads(response)
            except json.JSONDecodeError:
                analysis = {"raw_response": response}
            
            gaps = analysis.get("gaps", [])
            
            return OperationOutput(
                operation_id=self.operation_id,
                success=True,
                result={
                    "topic": topic,
                    "covered_aspects": analysis.get("covered", []),
                    "gaps": gaps,
                    "recommendations": analysis.get("recommendations", []),
                    "coverage_score": 1.0 - (len(gaps) / max(len(expected_aspects), 1))
                },
                metadata={
                    "passages_analyzed": len(existing_passages),
                    "gap_count": len(gaps)
                }
            )
        except Exception as e:
            return OperationOutput(
                operation_id=self.operation_id,
                success=False,
                error_message=str(e),
                result={},
                metadata={}
            )
