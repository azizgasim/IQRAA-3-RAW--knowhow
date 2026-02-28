"""
Neo4j Client - عميل قاعدة بيانات الشبكة
للعلاقات والشبكات المعرفية

المسار: /home/user/iqraa-12-platform/dashboard/backend/neo4j_client.py
"""

from neo4j import GraphDatabase
from typing import List, Dict, Any


class Neo4jClient:
    """عميل Neo4j"""
    
    def __init__(
        self,
        uri: str = "bolt://localhost:7687",
        user: str = "neo4j",
        password: str = "neo4j"
    ):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
        print(f"✅ Neo4j Client connected to {uri}")
    
    def close(self):
        """إغلاق الاتصال"""
        self.driver.close()
    
    async def create_scholar_node(
        self,
        scholar_id: str,
        name: str,
        school: str = None,
        death_year: int = None
    ):
        """إنشاء عقدة عالم"""
        
        with self.driver.session() as session:
            query = """
            MERGE (s:Scholar {id: $scholar_id})
            SET s.name = $name,
                s.school = $school,
                s.death_year = $death_year
            RETURN s
            """
            
            result = session.run(
                query,
                scholar_id=scholar_id,
                name=name,
                school=school,
                death_year=death_year
            )
            
            return result.single()
    
    async def create_concept_node(
        self,
        concept_id: str,
        name: str,
        domain: str = None
    ):
        """إنشاء عقدة مفهوم"""
        
        with self.driver.session() as session:
            query = """
            MERGE (c:Concept {id: $concept_id})
            SET c.name = $name,
                c.domain = $domain
            RETURN c
            """
            
            result = session.run(
                query,
                concept_id=concept_id,
                name=name,
                domain=domain
            )
            
            return result.single()
    
    async def create_relationship(
        self,
        from_id: str,
        to_id: str,
        rel_type: str,
        properties: Dict = None
    ):
        """إنشاء علاقة"""
        
        with self.driver.session() as session:
            query = f"""
            MATCH (a {{id: $from_id}})
            MATCH (b {{id: $to_id}})
            MERGE (a)-[r:{rel_type}]->(b)
            SET r += $properties
            RETURN r
            """
            
            result = session.run(
                query,
                from_id=from_id,
                to_id=to_id,
                properties=properties or {}
            )
            
            return result.single()
    
    async def get_scholar_network(self, scholar_id: str, depth: int = 2):
        """الحصول على شبكة عالم"""
        
        with self.driver.session() as session:
            query = """
            MATCH path = (s:Scholar {id: $scholar_id})-[*1..2]-(related)
            RETURN path
            LIMIT 100
            """
            
            result = session.run(query, scholar_id=scholar_id)
            
            paths = []
            for record in result:
                paths.append(record["path"])
            
            return paths

