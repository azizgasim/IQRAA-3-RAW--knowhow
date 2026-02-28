#!/usr/bin/env python3
"""
سكريبت تقطيع النصوص العربية
يقطع النصوص الطويلة إلى أجزاء مع تداخل
"""
import os
import json
import re
from pathlib import Path
from typing import List, Dict, Generator
from datetime import datetime

# الإعدادات
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", 500))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", 50))
INPUT_PATH = Path(os.getenv("DATA_RAW_PATH", "./data/raw"))
OUTPUT_PATH = Path(os.getenv("DATA_PROCESSED_PATH", "./data/processed/chunked"))

def normalize_arabic(text: str) -> str:
    """تطبيع النص العربي"""
    text = re.sub(r'[\u064B-\u065F\u0670]', '', text)
    text = re.sub(r'[إأآا]', 'ا', text)
    text = re.sub(r'[يى]', 'ي', text)
    text = re.sub(r'ة', 'ه', text)
    return text

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> Generator[Dict, None, None]:
    """تقطيع النص إلى أجزاء"""
    text = re.sub(r'\s+', ' ', text).strip()
    words = text.split()
    
    if len(words) <= chunk_size:
        yield {
            "chunk_index": 0,
            "total_chunks": 1,
            "text": text,
            "word_count": len(words),
            "char_count": len(text)
        }
        return
    
    total_chunks = (len(words) - overlap) // (chunk_size - overlap) + 1
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk_words = words[i:i + chunk_size]
        if len(chunk_words) < overlap and i > 0:
            break
        
        chunk_text = ' '.join(chunk_words)
        yield {
            "chunk_index": i // (chunk_size - overlap),
            "total_chunks": total_chunks,
            "text": chunk_text,
            "word_count": len(chunk_words),
            "char_count": len(chunk_text),
            "start_word": i,
            "end_word": i + len(chunk_words)
        }

def extract_openiti_metadata(content: str, file_path: Path) -> Dict:
    """استخراج البيانات الوصفية من ملف OpenITI"""
    metadata = {
        "file_name": file_path.name,
        "author_id": "",
        "book_id": "",
        "version": ""
    }
    
    name_parts = file_path.stem.split('.')
    if len(name_parts) >= 2:
        metadata["author_id"] = name_parts[0]
        metadata["book_id"] = name_parts[1] if len(name_parts) > 1 else ""
    
    meta_match = re.search(r'#META#\s*(.*?)(?=#|$)', content, re.DOTALL)
    if meta_match:
        meta_text = meta_match.group(1)
        for line in meta_text.split('\n'):
            if '::' in line:
                key, value = line.split('::', 1)
                metadata[key.strip()] = value.strip()
    
    return metadata

def process_file(file_path: Path, output_dir: Path) -> Dict:
    """معالجة ملف واحد"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    metadata = extract_openiti_metadata(content, file_path)
    chunks = list(chunk_text(content))
    
    output_file = output_dir / f"{file_path.stem}_chunks.json"
    result = {
        "source_file": str(file_path),
        "metadata": metadata,
        "total_chunks": len(chunks),
        "chunks": chunks,
        "processed_at": datetime.now().isoformat()
    }
    
    output_dir.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    return {"file": str(file_path), "chunks": len(chunks)}

def process_directory(input_dir: Path = INPUT_PATH, output_dir: Path = OUTPUT_PATH):
    """معالجة مجلد كامل"""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    text_extensions = {'.txt', '.md', '.mARkdown'}
    files = [f for f in input_dir.rglob('*') if f.suffix in text_extensions]
    
    print(f"📂 وُجد {len(files)} ملف للمعالجة")
    
    results = []
    for i, file_path in enumerate(files, 1):
        try:
            result = process_file(file_path, output_dir)
            results.append(result)
            print(f"[{i}/{len(files)}] ✅ {file_path.name}: {result['chunks']} جزء")
        except Exception as e:
            print(f"[{i}/{len(files)}] ❌ {file_path.name}: {e}")
    
    report = {
        "processed_at": datetime.now().isoformat(),
        "total_files": len(files),
        "successful": len(results),
        "total_chunks": sum(r['chunks'] for r in results),
        "files": results
    }
    
    with open(output_dir / "processing_report.json", 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"\n📊 التقرير: {len(results)} ملف، {report['total_chunks']} جزء")
    return report

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="تقطيع النصوص")
    parser.add_argument("--input", "-i", type=Path, default=INPUT_PATH)
    parser.add_argument("--output", "-o", type=Path, default=OUTPUT_PATH)
    args = parser.parse_args()
    
    process_directory(args.input, args.output)
