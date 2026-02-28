"""
V1: Citation Audit - تدقيق الاستشهادات
بوابة إلزامية (Mandatory Gate)
"""
from typing import ClassVar
from ...models.enums import OperationCategory, AutonomyLevel
from ...models.schemas import OperationInput, OperationOutput
from ...core.base import BaseOperation, OperationRegistry
from ...infrastructure.bigquery_client import BigQueryClient
from ...infrastructure.config import Config


@OperationRegistry.register
class V1_CitationAudit(BaseOperation):
    """
    تدقيق الاستشهادات - بوابة إلزامية
    
    Non-negotiable: لا دمج بدون V1
    """
    
    operation_id: ClassVar[str] = "V1"
    name: ClassVar[str] = "Citation Audit"
    name_ar: ClassVar[str] = "تدقيق الاستشهادات"
    category: ClassVar[OperationCategory] = OperationCategory.VERIFY
    autonomy_level: ClassVar[AutonomyLevel] = AutonomyLevel.L0
    purpose: ClassVar[str] = "Verify all citations are valid"
    purpose_ar: ClassVar[str] = "التحقق من صحة جميع الاستشهادات"
    cost_estimate_usd: ClassVar[float] = 0.005
    is_mandatory_gate: ClassVar[bool] = True
    
    def __init__(self):
        super().__init__()
        self.config = Config.from_env()
        self.bq_client = BigQueryClient(self.config)
    
    async def _verify_citation(self, citation: dict) -> dict:
        """التحقق من استشهاد واحد"""
        passage_id = citation.get("passage_id")
        offset_start = citation.get("offset_start")
        offset_end = citation.get("offset_end")
        expected_text = citation.get("text", "")
        
        # Check if passage exists
        if not passage_id:
            return {"valid": False, "error": "Missing passage_id"}
        
        # Check offsets (non-negotiable rule)
        if offset_start is None or offset_end is None:
            return {"valid": False, "error": "Missing offsets (non-negotiable)"}
        
        # Verify text matches
        # TODO: Query BigQuery to verify actual text
        
        return {
            "valid": True,
            "passage_id": passage_id,
            "offset_start": offset_start,
            "offset_end": offset_end
        }
    
    async def _execute(self, input_data: OperationInput) -> OperationOutput:
        citations = input_data.parameters.get("citations", [])
        document_id = input_data.parameters.get("document_id", "")
        
        valid_citations = []
        invalid_citations = []
        missing_offsets = []
        
        for citation in citations:
            result = await self._verify_citation(citation)
            
            if result.get("valid"):
                valid_citations.append(result)
            elif "offsets" in result.get("error", ""):
                missing_offsets.append(citation)
            else:
                invalid_citations.append({**citation, "error": result.get("error")})
        
        total = len(citations)
        pass_rate = len(valid_citations) / total if total > 0 else 0.0
        
        # Gate passes if all citations are valid
        gate_passed = len(invalid_citations) == 0 and len(missing_offsets) == 0
        
        return OperationOutput(
            operation_id=self.operation_id,
            success=True,
            result={
                "gate_passed": gate_passed,
                "valid_citations": valid_citations,
                "invalid_citations": invalid_citations,
                "missing_offsets": missing_offsets,
                "pass_rate": pass_rate,
                "summary": {
                    "total": total,
                    "valid": len(valid_citations),
                    "invalid": len(invalid_citations),
                    "missing_offsets": len(missing_offsets)
                }
            },
            metadata={
                "document_id": document_id,
                "is_mandatory_gate": True
            }
        )
