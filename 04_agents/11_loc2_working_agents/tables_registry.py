"""
Tables Registry - يشمل الجداول الفارغة
"""

from google.cloud import bigquery
from typing import Dict, List, Optional
from dataclasses import dataclass


@dataclass
class TableDefinition:
    registry_id: str
    dataset_name: str
    table_name: str
    full_path: str
    category: str
    subcategory: str
    row_count: int
    size_gb: float
    status: str
    is_academic: bool
    data_domain: str
    access_tier: str
    
    @property
    def is_available(self) -> bool:
        return self.is_academic
    
    @property
    def is_filled(self) -> bool:
        return self.row_count > 0
    
    @property
    def is_empty(self) -> bool:
        return self.row_count == 0


class TablesRegistry:
    """سجل الجداول - يشمل الفارغة"""
    
    def __init__(self, bq_client: bigquery.Client):
        self.client = bq_client
        self.tables: Dict[str, TableDefinition] = {}
        
        self._load_from_bigquery()
        
        filled = len([t for t in self.tables.values() if t.is_filled])
        empty = len([t for t in self.tables.values() if t.is_empty])
        
        print(f"✅ Tables Registry (Complete)")
        print(f"   • Total: {len(self.tables)}")
        print(f"   • Filled: {filled}")
        print(f"   • Empty: {empty}")
    
    def _load_from_bigquery(self):
        sql = """
        SELECT 
            CONCAT("acad_", table_id) as registry_id,
            "iqraa_academic_v2" as dataset_name,
            table_id as table_name,
            CONCAT('iqraa_academic_v2.', table_id) as full_path,
            'research' as category,
            'academic' as subcategory,
            row_count,
            ROUND(size_bytes / 1073741824, 3) as size_gb,
            'active' as status,
            TRUE as is_academic,
            'academic' as data_domain,
            'standard' as access_tier
        FROM `iqraa_academic_v2.__TABLES__`
        WHERE TRUE
        ORDER BY row_count DESC
        """
        
        try:
            results = self.client.query(sql).result()
            
            for row in results:
                table_def = TableDefinition(
                    registry_id=f"acad_{row.table_name}",
                    dataset_name="iqraa_academic_v2",
                    table_name=row.table_name,
                    full_path=row.full_path,
                    category='research',
                    subcategory=row.data_domain or 'general',
                    row_count=int(row.row_count or 0),
                    size_gb=float(row.size_gb or 0),
                    status='filled' if row.row_count > 0 else 'empty',
                    is_academic=True,
                    data_domain=row.data_domain or 'general',
                    access_tier=row.access_tier or 'cold'
                )
                
                self.tables[table_def.table_name] = table_def
                
        except Exception as e:
            print(f"⚠️ خطأ: {e}")
    
    def get_table(self, key: str) -> Optional[TableDefinition]:
        return self.tables.get(key)
    
    def get_academic_tables(self) -> List[TableDefinition]:
        """كل الجداول الأكاديمية (مملوءة + فارغة)"""
        return [t for t in self.tables.values() if t.is_available]
    
    def get_filled_tables(self) -> List[TableDefinition]:
        """الجداول المملوءة فقط"""
        return [t for t in self.tables.values() if t.is_filled]
    
    def get_empty_tables(self) -> List[TableDefinition]:
        """الجداول الفارغة (تنتظر التوزيع)"""
        return [t for t in self.tables.values() if t.is_empty and t.is_academic]
    
    def get_research_tables(self) -> List[TableDefinition]:
        """alias للمملوءة"""
        return self.get_filled_tables()
    
    def get_tables_by_domain(self, domain: str) -> List[TableDefinition]:
        return [t for t in self.tables.values() if t.data_domain == domain and t.is_available]

