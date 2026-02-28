"""
E1: Text Search - البحث النصي
العملية الأولى في سلسلة الاستخراج
"""
from typing import ClassVar, Any, Optional

from ...models.enums import OperationCategory, AutonomyLevel
from ...models.schemas import OperationInput, OperationOutput
from ...core.base import BaseOperation, OperationRegistry
from ...infrastructure.bigquery_client import BigQueryClient
from ...infrastructure.config import Config


@OperationRegistry.register
class E1_TextSearch(BaseOperation):
    """
    البحث النصي في المقاطع الموحدة
    
    المدخلات:
        - query: نص البحث
        - corpus_scope: نطاق الكوربس (اختياري)
        - limit: عدد النتائج (افتراضي 100)
        
    المخرجات:
        - passages: قائمة المقاطع المطابقة
        - total_found: العدد الإجمالي
    """
    
    operation_id: ClassVar[str] = "E1"
    name: ClassVar[str] = "Text Search"
    name_ar: ClassVar[str] = "البحث النصي"
    category: ClassVar[OperationCategory] = OperationCategory.EXTRACT
    autonomy_level: ClassVar[AutonomyLevel] = AutonomyLevel.L0
    purpose: ClassVar[str] = "Search for text patterns in unified passages"
    purpose_ar: ClassVar[str] = "البحث عن أنماط نصية في المقاطع الموحدة"
    cost_estimate_usd: ClassVar[float] = 0.001
    
    def __init__(self):
        super().__init__()
        self.config = Config.from_env()
        self.bq_client = BigQueryClient(self.config)
    
    async def _execute(self, input_data: OperationInput) -> OperationOutput:
        """تنفيذ البحث النصي"""
        
        # Extract parameters
        query = input_data.parameters.get("query", "")
        corpus_scope = input_data.parameters.get("corpus_scope")
        limit = input_data.parameters.get("limit", 100)
        
        if not query:
            return OperationOutput(
                operation_id=self.operation_id,
                success=False,
                error_message="Query parameter is required",
                result={},
                metadata={}
            )
        
        # Execute search
        try:
            passages = await self.bq_client.search_passages_text(
                query=query,
                corpus_scope=corpus_scope,
                limit=limit,
            )
            
            return OperationOutput(
                operation_id=self.operation_id,
                success=True,
                result={
                    "passages": passages,
                    "total_found": len(passages),
                    "query": query,
                    "corpus_scope": corpus_scope,
                },
                metadata={
                    "limit_used": limit,
                    "sources_searched": corpus_scope or ["all"],
                }
            )
            
        except Exception as e:
            self.logger.error("text_search_failed", error=str(e))
            return OperationOutput(
                operation_id=self.operation_id,
                success=False,
                error_message=str(e),
                result={},
                metadata={}
            )
