#!/usr/bin/env python3
"""
Storage Abstraction Layer — طبقة تجريد التخزين
===================================================
DEC-P1-011 / DEC-P1-013

Supports:
  - LocalStorage: للتطوير والاختبار
  - GCSStorage: للإنتاج (gs://iqraa-pipeline/)

Usage:
  storage = GCSStorage(bucket_name="iqraa-pipeline")
  local_path = storage.download_to_temp("raw/openiti/file.txt")
  storage.upload_text(text, "cleaned/openiti/run_id/file.txt")
"""
import json
import logging
import tempfile
from abc import ABC, abstractmethod
from pathlib import Path
from typing import List, Optional

logger = logging.getLogger("pipeline.storage")


class StorageBackend(ABC):
    """واجهة موحدة للتخزين"""

    @abstractmethod
    def list_files(self, prefix: str, suffix_filter: Optional[str] = None) -> List[str]:
        """قائمة الملفات تحت prefix معيّن"""
        ...

    @abstractmethod
    def download_to_temp(self, path: str) -> Path:
        """تنزيل ملف إلى مسار مؤقت — يُرجع Path محلي"""
        ...

    @abstractmethod
    def upload_text(self, text: str, dest_path: str) -> str:
        """رفع نص إلى المخزن — يُرجع URI"""
        ...

    @abstractmethod
    def upload_json(self, data: dict, dest_path: str) -> str:
        """رفع JSON إلى المخزن — يُرجع URI"""
        ...

    @abstractmethod
    def file_exists(self, path: str) -> bool:
        ...


class LocalStorage(StorageBackend):
    """تخزين محلي للتطوير والاختبار"""

    def __init__(self, base_dir: str = "/tmp/iqraa-pipeline"):
        self.base = Path(base_dir)
        self.base.mkdir(parents=True, exist_ok=True)

    def list_files(self, prefix: str, suffix_filter: Optional[str] = None) -> List[str]:
        target = self.base / prefix
        if not target.exists():
            return []
        files = [
            str(f.relative_to(self.base))
            for f in target.rglob("*") if f.is_file()
        ]
        if suffix_filter:
            files = [f for f in files if f.endswith(suffix_filter)]
        return sorted(files)

    def download_to_temp(self, path: str) -> Path:
        full = self.base / path
        if not full.exists():
            raise FileNotFoundError("ملف غير موجود: {}".format(full))
        return full  # محلي — لا حاجة لتنزيل

    def upload_text(self, text: str, dest_path: str) -> str:
        full = self.base / dest_path
        full.parent.mkdir(parents=True, exist_ok=True)
        full.write_text(text, encoding="utf-8")
        logger.info("[LOCAL] كتابة: %s", full)
        return str(full)

    def upload_json(self, data: dict, dest_path: str) -> str:
        text = json.dumps(data, ensure_ascii=False, indent=2)
        return self.upload_text(text, dest_path)

    def file_exists(self, path: str) -> bool:
        return (self.base / path).exists()


class GCSStorage(StorageBackend):
    """تخزين Google Cloud Storage للإنتاج"""

    def __init__(self, bucket_name: str = "iqraa-pipeline", project: str = "iqraa-12"):
        from google.cloud import storage
        self._client = storage.Client(project=project)
        self._bucket = self._client.bucket(bucket_name)
        self._bucket_name = bucket_name
        self._project = project
        logger.info("[GCS] متصل بـ gs://%s/", bucket_name)

    def list_files(self, prefix: str, suffix_filter: Optional[str] = None) -> List[str]:
        blobs = self._client.list_blobs(self._bucket, prefix=prefix)
        paths = [b.name for b in blobs if not b.name.endswith("/")]
        if suffix_filter:
            paths = [p for p in paths if p.endswith(suffix_filter)]
        return sorted(paths)

    def download_to_temp(self, path: str) -> Path:
        blob = self._bucket.blob(path)
        if not blob.exists():
            raise FileNotFoundError(
                "غير موجود في GCS: gs://{}/{}".format(self._bucket_name, path)
            )
        suffix = Path(path).suffix or ".tmp"
        tmp = tempfile.NamedTemporaryFile(
            delete=False, suffix=suffix, prefix="iqraa_"
        )
        blob.download_to_filename(tmp.name)
        tmp.close()
        logger.info(
            "[GCS] تنزيل: gs://%s/%s → %s",
            self._bucket_name, path, tmp.name
        )
        return Path(tmp.name)

    def upload_text(self, text: str, dest_path: str) -> str:
        blob = self._bucket.blob(dest_path)
        blob.upload_from_string(
            text.encode("utf-8"),
            content_type="text/plain; charset=utf-8"
        )
        uri = "gs://{}/{}".format(self._bucket_name, dest_path)
        logger.info("[GCS] رفع: %s", uri)
        return uri

    def upload_json(self, data: dict, dest_path: str) -> str:
        blob = self._bucket.blob(dest_path)
        content = json.dumps(data, ensure_ascii=False, indent=2)
        blob.upload_from_string(
            content.encode("utf-8"),
            content_type="application/json; charset=utf-8"
        )
        uri = "gs://{}/{}".format(self._bucket_name, dest_path)
        logger.info("[GCS] رفع JSON: %s", uri)
        return uri

    def file_exists(self, path: str) -> bool:
        return self._bucket.blob(path).exists()


def create_storage(mode: str = "gcs", **kwargs) -> StorageBackend:
    """
    Factory — ينشئ StorageBackend حسب البيئة
    mode: 'local' أو 'gcs'
    """
    if mode == "local":
        return LocalStorage(**kwargs)
    elif mode == "gcs":
        return GCSStorage(**kwargs)
    else:
        raise ValueError("وضع تخزين غير معروف: {}".format(mode))
