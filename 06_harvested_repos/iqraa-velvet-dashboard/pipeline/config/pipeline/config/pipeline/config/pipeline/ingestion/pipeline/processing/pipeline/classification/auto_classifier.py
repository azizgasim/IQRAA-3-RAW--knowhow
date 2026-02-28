#!/usr/bin/env python3
"""
سكريبت التصنيف التلقائي للنصوص
يصنف النصوص على 15 فئة بناءً على الكلمات المفتاحية
"""
import os
import json
import re
from pathlib import Path
from typing import Dict, List, Tuple
from collections import defaultdict
from datetime import datetime

# المسارات
CONFIG_PATH = Path("./pipeline/config/tables_schema.json")
INPUT_PATH = Path(os.getenv("DATA_PROCESSED_PATH", "./data/processed/chunked"))
OUTPUT_PATH = Path("./data/processed/classified")

def load_categories() -> Dict:
    """تحميل الفئات والكلمات المفتاحية"""
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
            schema = json.load(f)
        return schema.get("categories", {})
    return {}

def classify_text(text: str, metadata: Dict, categories: Dict) -> List[Tuple[str, float]]:
    """تصنيف النص بناءً على الكلمات المفتاحية"""
    scores = defaultdict(float)
    text_lower = text.lower()
    
    title = metadata.get("book_id", "").lower()
    author = metadata.get("author_id", "").lower()
    
    for cat_id, cat_info in categories.items():
        keywords = cat_info.get("keywords", [])
        
        for keyword in keywords:
            count = len(re.findall(keyword, text_lower))
            scores[cat_id] += count * 1.0
            
            if keyword in title:
                scores[cat_id] += 5.0
            
            if keyword in author:
                scores[cat_id] += 3.0
    
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    
    max_score = sorted_scores[0][1] if sorted_scores and sorted_scores[0][1] > 0 else 1
    normalized = [(cat, score/max_score) for cat, score in sorted_scores if score > 0]
    
    return normalized[:3]

def classify_chunk(chunk: Dict, metadata: Dict, categories: Dict) -> Dict:
    """تصنيف جزء واحد"""
    classifications = classify_text(chunk["text"], metadata, categories)
    
    return {
        **chunk,
        "classifications": [
            {"category": cat, "confidence": round(conf, 3)}
            for cat, conf in classifications
        ],
        "primary_category": classifications[0][0] if classifications else "15_indexes"
    }

def process_chunked_file(file_path: Path, categories: Dict, output_dir: Path) -> Dict:
    """معالجة ملف مقطع"""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    metadata = data.get("metadata", {})
    chunks = data.get("chunks", [])
    
    classified_chunks = [
        classify_chunk(chunk, metadata, categories)
        for chunk in chunks
    ]
    
    category_counts = defaultdict(int)
    for chunk in classified_chunks:
        category_counts[chunk["primary_category"]] += 1
    
    primary_category = max(category_counts, key=category_counts.get) if category_counts else "15_indexes"
    
    result = {
        **data,
        "chunks": classified_chunks,
        "file_classification": {
            "primary_category": primary_category,
            "category_distribution": dict(category_counts)
        }
    }
    
    category_dir = output_dir / primary_category
    category_dir.mkdir(parents=True, exist_ok=True)
    
    output_file = category_dir / file_path.name
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    return {
        "file": str(file_path),
        "category": primary_category,
        "chunks": len(classified_chunks)
    }

def classify_all(input_dir: Path = INPUT_PATH, output_dir: Path = OUTPUT_PATH):
    """تصنيف جميع الملفات"""
    categories = load_categories()
    output_dir.mkdir(parents=True, exist_ok=True)
    
    files = list(input_dir.glob("*_chunks.json"))
    print(f"📂 وُجد {len(files)} ملف للتصنيف")
    
    results = []
    category_stats = defaultdict(int)
    
    for i, file_path in enumerate(files, 1):
        try:
            result = process_chunked_file(file_path, categories, output_dir)
            results.append(result)
            category_stats[result["category"]] += 1
            print(f"[{i}/{len(files)}] ✅ {file_path.name} → {result['category']}")
        except Exception as e:
            print(f"[{i}/{len(files)}] ❌ {file_path.name}: {e}")
    
    report = {
        "classified_at": datetime.now().isoformat(),
        "total_files": len(files),
        "classified": len(results),
        "category_distribution": dict(category_stats)
    }
    
    with open(output_dir / "classification_report.json", 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"\n📊 توزيع الفئات:")
    for cat, count in sorted(category_stats.items()):
        print(f"  {cat}: {count} ملف")
    
    return report

if __name__ == "__main__":
    classify_all()
