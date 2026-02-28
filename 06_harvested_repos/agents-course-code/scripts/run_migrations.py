#!/usr/bin/env python3
"""
IQRA-12 Migration Runner
"""
import sys
from pathlib import Path
from google.cloud import bigquery


def run_migrations(project_id: str = "iqraa-12"):
    """Run all SQL migration files"""
    client = bigquery.Client(project=project_id)
    migrations_dir = Path(__file__).parent.parent / "sql" / "migrations"
    
    sql_files = sorted(migrations_dir.glob("*.sql"))
    print(f"Found {len(sql_files)} migration files")
    
    for sql_file in sql_files:
        print(f"\nRunning: {sql_file.name}")
        with open(sql_file, "r", encoding="utf-8") as f:
            sql_content = f.read()
        
        statements = [s.strip() for s in sql_content.split(";") if s.strip()]
        
        for i, statement in enumerate(statements, 1):
            if statement.startswith("--"):
                continue
            try:
                job = client.query(statement)
                job.result()
                print(f"  Statement {i}: OK")
            except Exception as e:
                if "Already Exists" in str(e):
                    print(f"  Statement {i}: SKIP")
                else:
                    print(f"  Statement {i}: ERROR - {e}")


if __name__ == "__main__":
    project = sys.argv[1] if len(sys.argv) > 1 else "iqraa-12"
    print(f"Running migrations for project: {project}")
    run_migrations(project)
