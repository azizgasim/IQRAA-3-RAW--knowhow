#!/usr/bin/env python3
"""
سكريبت رفع البيانات إلى BigQuery
يرفع الملفات المصنفة إلى الجداول المناسبة
"""
import os
import json
from pathlib import Path
from typing import Dict, List
from datetime import datetime

# الإعدادات
PROJECT_ID = os.getenv("GCP_PROJECT_ID", "iqraa-research-project")
DATASET_ID = os.getenv("BIGQUERY_DATASET", "iqraa_12_dataset")
CREDENTIALS_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "./config/service-account.json")
INPUT_PATH = Path("./data/processed/classified")
BATCH_SIZE = int(os.getenv("BATCH_SIZE", 1000))

# ربط الفئات بالجداول
CATEGORY_TO_TABLE = {
    "01_fiqh": "01_fiqh_rulings",
    "02_hadith": "04_hadith_texts",
    "03_tafsir": "08_tafsir_verses",
    "04_aqeedah": "04_kalam_schools",
    "05_history": "11_rulers_segments",
    "06_literature": "14_poetry",
    "07_philosophy": "17_falsafa_texts",
    "08_sufism": "20_tasawwuf_texts",
    "09_language": "23_nahw",
    "10_medicine": "27_tibb_texts",
    "11_science": "30_astronomy",
    "12_law": "33_qada",
    "13_manuscripts": "36_manuscript_catalog",
    "14_education": "39_madrasas",
    "15_indexes": "text_segments_micro_index"
}

def get_client():
    """إنشاء عميل BigQuery"""
    try:
        from google.cloud import bigquery
        from google.oauth2 import service_account
        
        if os.path.exists(CREDENTIALS_PATH):
            credentials = service_account.Credentials.from_service_account_file(CREDENTIALS_PATH)
            return bigquery.Client(project=PROJECT_ID, credentials=credentials)
        return bigquery.Client(project=PROJECT_ID)
    except ImportError:
        print("⚠️ مكتبة google-cloud-bigquery غير مثبتة")
        print("   نفذ: pip install google-cloud-bigquery")
        return None

def prepare_row(chunk: Dict, metadata: Dict, source_file: str) -> Dict:
    """تحضير صف للإدراج"""
    return {
        "segment_id": f"{metadata.get('book_id', 'unknown')}_{chunk['chunk_index']}",
        "book_id": metadata.get("book_id", ""),
        "author_id": metadata.get("author_id", ""),
        "chunk_index": chunk["chunk_index"],
        "total_chunks": chunk["total_chunks"],
        "text_content": chunk["text"],
        "word_count": chunk["word_count"],
        "char_count": chunk["char_count"],
        "primary_category": chunk.get("primary_category", ""),
        "confidence_score": chunk.get("classifications", [{}])[0].get("confidence", 0),
        "source_file": source_file,
        "created_at": datetime.now().isoformat()
    }

def upload_file(file_path: Path, client) -> Dict:
    """رفع ملف واحد"""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    metadata = data.get("metadata", {})
    chunks = data.get("chunks", [])
    category = data.get("file_classification", {}).get("primary_category", "15_indexes")
    
    table_name = CATEGORY_TO_TABLE.get(category, "text_segments_micro_index")
    table_id = f"{PROJECT_ID}.{DATASET_ID}.{table_name}"
    
    rows = [prepare_row(chunk, metadata, str(file_path)) for chunk in chunks]
    
    errors = []
    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i:i + BATCH_SIZE]
        batch_errors = client.insert_rows_json(table_id, batch)
        errors.extend(batch_errors)
    
    return {
        "file": str(file_path),
        "table": table_name,
        "rows": len(rows),
        "errors": len(errors)
    }

def upload_all(input_dir: Path = INPUT_PATH):
    """رفع جميع الملفات"""
    client = get_client()
    if not client:
        return []
    
    files = list(input_dir.rglob("*.json"))
    print(f"📂 وُجد {len(files)} ملف للرفع")
    
    results = []
    total_rows = 0
    total_errors = 0
    
    for i, file_path in enumerate(files, 1):
        if file_path.name == "classification_report.json":
            continue
        try:
            result = upload_file(file_path, client)
            results.append(result)
            total_rows += result["rows"]
            total_errors += result["errors"]
            print(f"[{i}/{len(files)}] ✅ {file_path.name} → {result['table']} ({result['rows']} صف)")
        except Exception as e:
            print(f"[{i}/{len(files)}] ❌ {file_path.name}: {e}")
    
    report = {
        "uploaded_at": datetime.now().isoformat(),
        "total_files": len(results),
        "total_rows": total_rows,
        "total_errors": total_errors
    }
    
    print(f"\n📊 الملخص:")
    print(f"  الملفات: {len(results)}")
    print(f"  الصفوف: {total_rows}")
    print(f"  الأخطاء: {total_errors}")
    
    return results

if __name__ == "__main__":
    upload_all()
