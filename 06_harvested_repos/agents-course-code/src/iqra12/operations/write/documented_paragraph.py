"""W1: Documented Paragraph - الفقرة الموثقة"""
from typing import ClassVar
from ...models.enums import OperationCategory, AutonomyLevel
from ...core.base import BaseOperation, OperationRegistry
from ...models.schemas import OperationInput, OperationOutput

@OperationRegistry.register
class W1_DocumentedParagraph(BaseOperation):
    operation_id: ClassVar[str] = "W1"
    name: ClassVar[str] = "Documented Paragraph"
    name_ar: ClassVar[str] = "الفقرة الموثقة"
    category: ClassVar[OperationCategory] = OperationCategory.WRITE
    autonomy_level: ClassVar[AutonomyLevel] = AutonomyLevel.L2

    async def _execute(self, input_data: OperationInput) -> OperationOutput:
        claim = input_data.parameters.get("claim", "")
        evidence = input_data.parameters.get("evidence", [])
        paragraph = {"text": "", "citations": [], "claim_support": []}
        return OperationOutput(
            operation_id=self.operation_id,
            success=True,
            result={"paragraph": paragraph},
            metadata={"evidence_used": len(evidence)}
        )
