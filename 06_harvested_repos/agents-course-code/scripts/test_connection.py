#!/usr/bin/env python3
"""
IQRA-12 Connection Test
اختبار الاتصال بـ BigQuery
"""
import sys
from google.cloud import bigquery


def test_connection(project_id: str = "iqraa-12"):
    """Test BigQuery connection and list available tables"""
    
    print(f"Testing connection to project: {project_id}")
    print("=" * 60)
    
    try:
        client = bigquery.Client(project=project_id)
        print("Connection: OK")
    except Exception as e:
        print(f"Connection: FAILED - {e}")
        return
    
    # List datasets
    print("\nDatasets:")
    print("-" * 40)
    
    datasets = list(client.list_datasets())
    for dataset in datasets:
        print(f"  {dataset.dataset_id}")
        
        # List tables in each dataset
        tables = list(client.list_tables(dataset.reference))
        for table in tables[:5]:
            print(f"    - {table.table_id}")
        if len(tables) > 5:
            print(f"    ... and {len(tables) - 5} more")
    
    # Test specific table
    print("\n" + "=" * 60)
    print("Testing documents_text_chunks schema:")
    print("-" * 40)
    
    try:
        table = client.get_table(f"{project_id}.diwan_iqraa_elmi.documents_text_chunks")
        print(f"Table found with {table.num_rows:,} rows")
        print("\nSchema:")
        for field in table.schema[:10]:
            print(f"  {field.name}: {field.field_type}")
        if len(table.schema) > 10:
            print(f"  ... and {len(table.schema) - 10} more columns")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    project = sys.argv[1] if len(sys.argv) > 1 else "iqraa-12"
    test_connection(project)
