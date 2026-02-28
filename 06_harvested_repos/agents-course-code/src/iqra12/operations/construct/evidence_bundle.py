"""C1: Evidence Bundle - تجميع الأدلة"""
from typing import ClassVar
from ...models.enums import OperationCategory, AutonomyLevel
from ...core.base import BaseOperation, OperationRegistry
from ...models.schemas import OperationInput, OperationOutput

@OperationRegistry.register
class C1_EvidenceBundle(BaseOperation):
    operation_id: ClassVar[str] = "C1"
    name: ClassVar[str] = "Evidence Bundle"
    name_ar: ClassVar[str] = "تجميع الأدلة"
    category: ClassVar[OperationCategory] = OperationCategory.CONSTRUCT
    autonomy_level: ClassVar[AutonomyLevel] = AutonomyLevel.L2

    async def _execute(self, input_data: OperationInput) -> OperationOutput:
        claim_id = input_data.parameters.get("claim_id", "")
        evidence_ids = input_data.parameters.get("evidence_ids", [])
        bundle = {"claim_id": claim_id, "evidences": evidence_ids, "strength": 0.0}
        return OperationOutput(
            operation_id=self.operation_id,
            success=True,
            result={"bundle": bundle},
            metadata={"evidence_count": len(evidence_ids)}
        )
