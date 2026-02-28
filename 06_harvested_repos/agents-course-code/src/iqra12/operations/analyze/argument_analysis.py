"""
A1: Argument Analysis - تحليل الحجج
"""
from typing import ClassVar
from ...models.enums import OperationCategory, AutonomyLevel
from ...models.schemas import OperationInput, OperationOutput
from ...core.base import BaseOperation, OperationRegistry
from ...infrastructure.vertex_client import VertexAIClient
from ...infrastructure.config import Config


@OperationRegistry.register
class A1_ArgumentAnalysis(BaseOperation):
    """تحليل بنية الحجج في النص"""
    
    operation_id: ClassVar[str] = "A1"
    name: ClassVar[str] = "Argument Analysis"
    name_ar: ClassVar[str] = "تحليل الحجج"
    category: ClassVar[OperationCategory] = OperationCategory.ANALYZE
    autonomy_level: ClassVar[AutonomyLevel] = AutonomyLevel.L1
    purpose: ClassVar[str] = "Analyze argument structure"
    purpose_ar: ClassVar[str] = "تحليل بنية الحجج والاستدلالات"
    cost_estimate_usd: ClassVar[float] = 0.02
    
    def __init__(self):
        super().__init__()
        self.config = Config.from_env()
        self.vertex_client = VertexAIClient(self.config)
    
    async def _execute(self, input_data: OperationInput) -> OperationOutput:
        text = input_data.parameters.get("text", "")
        
        if not text:
            return OperationOutput(
                operation_id=self.operation_id,
                success=False,
                error_message="Text parameter is required",
                result={},
                metadata={}
            )
        
        prompt = f"""
حلل النص التالي واستخرج بنية الحجج:

النص:
{text}

استخرج:
1. المقدمات (premises)
2. النتائج (conclusions)  
3. نوع الاستدلال (deductive/inductive/analogical)
4. قوة الحجة (weak/moderate/strong)

أجب بصيغة JSON.
"""
        
        try:
            response = await self.vertex_client.generate_text(prompt, temperature=0.1)
            
            import json
            try:
                analysis = json.loads(response)
            except json.JSONDecodeError:
                analysis = {"raw_response": response}
            
            return OperationOutput(
                operation_id=self.operation_id,
                success=True,
                result={
                    "arguments": analysis.get("arguments", []),
                    "premises": analysis.get("premises", []),
                    "conclusions": analysis.get("conclusions", []),
                    "reasoning_type": analysis.get("reasoning_type", "unknown"),
                    "strength": analysis.get("strength", "unknown")
                },
                metadata={"text_length": len(text)}
            )
        except Exception as e:
            return OperationOutput(
                operation_id=self.operation_id,
                success=False,
                error_message=str(e),
                result={},
                metadata={}
            )
