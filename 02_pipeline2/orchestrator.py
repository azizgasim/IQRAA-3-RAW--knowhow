#!/usr/bin/env python3
"""
Pipeline Orchestrator v2 — منسّق خط المعالجة -1
=================================================
DEC-P1-009/010 + DEC-P1-011 (Storage Integration)
DEC-P1-016 (Manifest + BQ Write)

التغييرات عن v1:
  - يستقبل StorageBackend بدل bucket string
  - process_file يقبل مسار GCS نسبي
  - يرفع المخرجات لكل مرحلة (converted/cleaned/chunked/rejected)
  - يكتب manifest JSON لكل run
  - يكتب lineage مباشرة لـ BigQuery
  - process_gcs_prefix بديل process_directory لـ GCS
  - process_directory يبقى للاختبار المحلي
"""
import json
import logging
import uuid
from datetime import datetime, timezone
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional

from .converter_registry import ConverterRegistry, ConversionResult, FileFormat
from .text_cleaner import get_cleaner, CleanResult
from .quality_gate import QualityGate, QualityResult
from .chunker import ArabicChunker, ChunkingResult, Chunk
from .storage import StorageBackend

logger = logging.getLogger("pipeline.orchestrator")


# ─────────────────────────────────────────────
# Data Classes
# ─────────────────────────────────────────────

@dataclass
class PipelineResult:
    """نتيجة معالجة ملف واحد"""
    run_id: str
    source_path: str
    status: str                  # success | rejected | error
    stage_reached: str           # download | convert | clean | quality | chunk
    conversion: Optional[ConversionResult] = None
    cleaning: Optional[CleanResult] = None
    quality: Optional[QualityResult] = None
    chunking: Optional[ChunkingResult] = None
    error: str = ""
    started_at: str = ""
    completed_at: str = ""
    duration_seconds: float = 0.0
    # v2 additions
    converted_uri: str = ""
    cleaned_uri: str = ""
    chunked_uris: List[str] = field(default_factory=list)
    manifest_uri: str = ""


# ─────────────────────────────────────────────
# Orchestrator
# ─────────────────────────────────────────────

class PipelineOrchestrator:
    """
    منسّق خط المعالجة -1

    Usage (GCS):
        from pipeline.storage import create_storage
        storage = create_storage("gcs", bucket_name="iqraa-pipeline")
        orch = PipelineOrchestrator(storage=storage)
        result = orch.process_file("raw/other/global_library/book.pdf", source_collection="global_library")

    Usage (Local):
        storage = create_storage("local", base_dir="/tmp/iqraa-pipeline")
        orch = PipelineOrchestrator(storage=storage)
        result = orch.process_file("raw/test/sample.txt")
    """

    def __init__(
        self,
        storage: StorageBackend,
        project: str = "iqraa-12",
        dataset: str = "diwan_iqraa_v2",
        chunk_size: int = 300,
        chunk_overlap: int = 30,
        remove_diacritics: bool = True,
        deep_clean_threshold: float = 0.7,
        write_bq: bool = True,
        language: str = "ar",
    ):
        """
        تهيئة خط المعالجة.

        Args:
            storage: واجهة التخزين (LocalStorage أو GCSStorage)
            project: معرّف مشروع GCP (افتراضي: "iqraa-12")
            dataset: اسم dataset في BigQuery (افتراضي: "diwan_iqraa_v2")
            chunk_size: عدد الكلمات لكل قطعة (افتراضي: 300)
            chunk_overlap: عدد كلمات التداخل بين القطع (افتراضي: 30)
            remove_diacritics: إزالة التشكيل العربي (افتراضي: True)
            deep_clean_threshold: عتبة الجودة لتفعيل التنظيف العميق (افتراضي: 0.7)
            write_bq: كتابة النتائج في BigQuery (افتراضي: True)
            language: لغة النصوص "ar" | "en" | "mixed" (افتراضي: "ar")
        """
        self.storage = storage
        self.project = project
        self.dataset = dataset
        self.write_bq = write_bq

        self.converter = ConverterRegistry()
        self.cleaner = get_cleaner(
            language=language,
            remove_diacritics=remove_diacritics,
            deep_threshold=deep_clean_threshold,
        )
        self.language = language
        self.quality_gate = QualityGate(language=language)
        self.chunker = ArabicChunker(
            chunk_size=chunk_size,
            overlap=chunk_overlap,
        )

        self.stats = {
            "files_processed": 0,
            "files_success": 0,
            "files_rejected": 0,
            "files_error": 0,
            "total_chunks": 0,
        }

        # Lazy BQ client — لا نُنشئه إلا عند الحاجة
        self._bq_client = None

    # ─────────────────────────────────────────
    # Core: process_file
    # ─────────────────────────────────────────

    def process_file(
        self,
        source_path: str,
        source_collection: str = "",
    ) -> PipelineResult:
        """
        معالجة ملف واحد عبر جميع مراحل الخط.

        Args:
            source_path: مسار نسبي في المخزن
                         (مثال: "raw/other/global_library/10-4-42/book.pdf")
            source_collection: تصنيف المجموعة (مثال: "global_library")

        Returns:
            PipelineResult مع كل تفاصيل المعالجة
        """
        run_id = str(uuid.uuid4())[:12]
        started = datetime.now(timezone.utc)
        stem = Path(source_path).stem
        self.stats["files_processed"] += 1

        # ── 1. تنزيل من المخزن ──────────────────
        try:
            local_path = self.storage.download_to_temp(source_path)
        except FileNotFoundError as e:
            return self._finalize_error(
                run_id, source_path, "download", str(e), started, source_collection
            )
        except Exception as e:
            return self._finalize_error(
                run_id, source_path, "download", str(e), started, source_collection
            )

        # ── 2. تحويل ────────────────────────────
        try:
            conversion = self.converter.convert(local_path)
        except Exception as e:
            return self._finalize_error(
                run_id, source_path, "convert", str(e), started, source_collection
            )
        if not conversion.success:
            return self._finalize_error(
                run_id, source_path, "convert",
                "; ".join(conversion.errors), started, source_collection
            )

        # رفع النص المحوّل
        converted_path = "converted/{}/{}. txt".format(run_id, stem)
        try:
            converted_uri = self.storage.upload_text(conversion.text, converted_path)
        except Exception as e:
            logger.warning("فشل رفع النص المحوّل: %s", e)
            converted_uri = ""

        # ── 3. تنظيف ────────────────────────────
        try:
            pre_quality = self.quality_gate.check(conversion.text)
            cleaning = self.cleaner.clean(
                conversion.text, quality_score=pre_quality.score
            )
        except Exception as e:
            return self._finalize_error(
                run_id, source_path, "clean", str(e), started, source_collection
            )

        # رفع النص المنظّف
        cleaned_path = "cleaned/{}/{}.txt".format(run_id, stem)
        try:
            cleaned_uri = self.storage.upload_text(cleaning.text, cleaned_path)
        except Exception as e:
            logger.warning("فشل رفع النص المنظّف: %s", e)
            cleaned_uri = ""

        # ── 4. جودة ─────────────────────────────
        try:
            quality = self.quality_gate.check(cleaning.text)
        except Exception as e:
            return self._finalize_error(
                run_id, source_path, "quality", str(e), started, source_collection
            )

        if not quality.passed:
            # رفع إلى rejected/
            rejected_path = "rejected/{}/{}.txt".format(run_id, stem)
            try:
                self.storage.upload_text(cleaning.text, rejected_path)
            except Exception as e:
                logger.warning("فشل رفع الملف المرفوض: %s", e)

            self.stats["files_rejected"] += 1
            done = datetime.now(timezone.utc)
            result = PipelineResult(
                run_id=run_id,
                source_path=source_path,
                status="rejected",
                stage_reached="quality",
                conversion=conversion,
                cleaning=cleaning,
                quality=quality,
                started_at=started.isoformat(),
                completed_at=done.isoformat(),
                duration_seconds=(done - started).total_seconds(),
                converted_uri=converted_uri,
                cleaned_uri=cleaned_uri,
            )
            self._write_manifest(result, source_collection)
            self._write_lineage(result)
            return result

        # ── 5. تقطيع ────────────────────────────
        try:
            chunking = self.chunker.chunk(
                cleaning.text,
                source_path=source_path,
                metadata={
                    "run_id": run_id,
                    "source_collection": source_collection,
                    "source_format": conversion.source_format.value,
                    "quality_score": quality.score,
                },
            )
        except Exception as e:
            return self._finalize_error(
                run_id, source_path, "chunk", str(e), started, source_collection
            )

        # رفع القطع
        chunked_uris = []
        for chunk in chunking.chunks:
            chunk_path = "chunked/{}/{:04d}.txt".format(run_id, chunk.chunk_index)
            try:
                uri = self.storage.upload_text(chunk.text, chunk_path)
                chunked_uris.append(uri)
            except Exception as e:
                logger.warning("فشل رفع القطعة %d: %s", chunk.chunk_index, e)

        # ── 6. نجاح ─────────────────────────────
        self.stats["files_success"] += 1
        self.stats["total_chunks"] += chunking.total_chunks
        done = datetime.now(timezone.utc)

        result = PipelineResult(
            run_id=run_id,
            source_path=source_path,
            status="success",
            stage_reached="chunk",
            conversion=conversion,
            cleaning=cleaning,
            quality=quality,
            chunking=chunking,
            started_at=started.isoformat(),
            completed_at=done.isoformat(),
            duration_seconds=(done - started).total_seconds(),
            converted_uri=converted_uri,
            cleaned_uri=cleaned_uri,
            chunked_uris=chunked_uris,
        )

        self._write_manifest(result, source_collection)
        self._write_lineage(result)
        return result

    # ─────────────────────────────────────────
    # Batch Processing
    # ─────────────────────────────────────────

    def process_gcs_prefix(
        self,
        prefix: str,
        source_collection: str = "",
    ) -> List[PipelineResult]:
        """
        معالجة كل الملفات المدعومة تحت prefix في المخزن.

        يكتشف الصيغ المدعومة تلقائياً ويعالج كل ملف عبر process_file.

        Returns:
            List[PipelineResult]: نتيجة لكل ملف مُعالَج

        Args:
            prefix: مسار في المخزن (مثال: "raw/other/global_library/")
            source_collection: تصنيف المجموعة
        """
        supported = set(self.converter.supported_formats())
        all_files = self.storage.list_files(prefix)
        files = [
            f for f in all_files
            if Path(f).suffix.lower() in supported
        ]
        logger.info(
            "وُجد %d ملف مدعوم من أصل %d تحت %s",
            len(files), len(all_files), prefix,
        )
        results = []
        for f in files:
            try:
                result = self.process_file(f, source_collection)
                results.append(result)
                logger.info(
                    "[%s] %s → %s (%d chunks)",
                    result.run_id, Path(f).name, result.status,
                    result.chunking.total_chunks if result.chunking else 0,
                )
            except Exception as e:
                logger.error("خطأ غير متوقع في %s: %s", f, e)
        return results

    def process_directory(
        self,
        directory: Path,
        source_collection: str = "",
    ) -> List[PipelineResult]:
        """
        معالجة مجلد محلي — للاختبار مع LocalStorage.

        يبحث بشكل متكرر (rglob) عن كل الملفات المدعومة.

        Args:
            directory: مسار المجلد المحلي
            source_collection: تصنيف المجموعة

        Returns:
            List[PipelineResult]: نتيجة لكل ملف مُعالَج
        يتطلب أن يكون self.storage من نوع LocalStorage.
        """
        if not directory.is_dir():
            logger.error("ليس مجلداً: %s", directory)
            return []
        supported = set(self.converter.supported_formats())
        files = sorted(
            f for f in directory.rglob("*")
            if f.is_file() and f.suffix.lower() in supported
        )
        logger.info("وُجد %d ملف مدعوم في %s", len(files), directory)
        results = []
        for f in files:
            # تحويل المسار المحلي إلى مسار نسبي
            try:
                rel = str(f.relative_to(self.storage.base))
            except (AttributeError, ValueError):
                rel = str(f)
            result = self.process_file(rel, source_collection)
            results.append(result)
        return results

    # ─────────────────────────────────────────
    # Manifest
    # ─────────────────────────────────────────

    def _write_manifest(
        self,
        result: PipelineResult,
        source_collection: str,
    ) -> None:
        """كتابة manifest JSON لكل run"""
        manifest = {
            "run_id": result.run_id,
            "source_path": result.source_path,
            "source_collection": source_collection,
            "status": result.status,
            "stage_reached": result.stage_reached,
            "chunks_produced": (
                result.chunking.total_chunks if result.chunking else 0
            ),
            "quality_score": (
                result.quality.score if result.quality else None
            ),
            "quality_flags": (
                result.quality.flag_names if result.quality else []
            ),
            "source_format": (
                result.conversion.source_format.value
                if result.conversion else "unknown"
            ),
            "converted_uri": result.converted_uri,
            "cleaned_uri": result.cleaned_uri,
            "chunked_uris_count": len(result.chunked_uris),
            "error": result.error or None,
            "started_at": result.started_at,
            "completed_at": result.completed_at,
            "duration_seconds": result.duration_seconds,
            "pipeline_version": "v2",
        }
        manifest_path = "manifests/{}.json".format(result.run_id)
        try:
            uri = self.storage.upload_json(manifest, manifest_path)
            result.manifest_uri = uri
            logger.info("[MANIFEST] %s", uri)
        except Exception as e:
            logger.error("فشل كتابة manifest %s: %s", result.run_id, e)

    # ─────────────────────────────────────────
    # BigQuery Lineage
    # ─────────────────────────────────────────

    def _get_bq_client(self):
        """Lazy initialization لـ BigQuery client"""
        if self._bq_client is None:
            from google.cloud import bigquery
            self._bq_client = bigquery.Client(project=self.project)
        return self._bq_client

    def _write_lineage(self, result: PipelineResult) -> None:
        """كتابة lineage لـ BigQuery"""
        if not self.write_bq:
            return

        try:
            client = self._get_bq_client()

            # pipeline_runs
            run_row = self.record_lineage(result)
            run_table = "{}.{}.pipeline_runs".format(
                self.project, self.dataset
            )
            errors = client.insert_rows_json(run_table, [run_row])
            if errors:
                logger.error(
                    "[BQ] أخطاء في pipeline_runs: %s", errors
                )
            else:
                logger.info(
                    "[BQ] pipeline_runs ← %s", result.run_id
                )

            # chunk_lineage
            if result.chunking and result.chunking.chunks:
                chunk_rows = self.record_chunk_lineage(result)
                chunk_table = "{}.{}.chunk_lineage".format(
                    self.project, self.dataset
                )
                # دفعات من 500 صف لتجنب حدود streaming insert
                batch_size = 500
                for i in range(0, len(chunk_rows), batch_size):
                    batch = chunk_rows[i : i + batch_size]
                    errors = client.insert_rows_json(chunk_table, batch)
                    if errors:
                        logger.error(
                            "[BQ] أخطاء في chunk_lineage (batch %d): %s",
                            i // batch_size, errors,
                        )
                logger.info(
                    "[BQ] chunk_lineage ← %d صف لـ %s",
                    len(chunk_rows), result.run_id,
                )

        except Exception as e:
            logger.error("[BQ] فشل كتابة lineage لـ %s: %s", result.run_id, e)

    # ─────────────────────────────────────────
    # Lineage Record Builders (unchanged from v1)
    # ─────────────────────────────────────────

    def record_lineage(self, result: PipelineResult) -> Dict:
        """بناء صف pipeline_runs — متوافق مع schema BQ"""
        return {
            "run_id": result.run_id,
            "source_gcs_uri": result.source_path,
            "source_format": (
                result.conversion.source_format.value
                if result.conversion else "unknown"
            ),
            "stage_reached": result.stage_reached,
            "status": result.status,
            "chunks_produced": (
                result.chunking.total_chunks if result.chunking else 0
            ),
            "quality_score": (
                result.quality.score if result.quality else None
            ),
            "quality_flags": (
                result.quality.flag_names if result.quality else []
            ),
            "error_message": result.error or None,
            "started_at": result.started_at,
            "completed_at": result.completed_at,
            "duration_seconds": result.duration_seconds,
            "metadata": json.dumps({
                "project": self.project,
                "dataset": self.dataset,
                "pipeline_version": "v2",
            }),
        }

    def record_chunk_lineage(self, result: PipelineResult) -> List[Dict]:
        """بناء صفوف chunk_lineage — متوافق مع schema BQ v2 (15 حقل)"""
        if not result.chunking:
            return []

        # استخراج البيانات المشتركة مرة واحدة
        source_file = result.source_path or ""
        language_detected = (
            "ar" if (result.quality and result.quality.arabic_ratio >= 0.5)
            else "other" if result.quality
            else ""
        )
        converter_used = (
            result.conversion.source_format.value
            if result.conversion
            else "unknown"
        )
        cleaning_level = (
            "deep" if (result.cleaning and result.cleaning.deep_applied)
            else "quick" if (result.cleaning and result.cleaning.quick_applied)
            else "none"
        )
        chunk_method = "word_overlap_300_30"

        return [
            {
                "chunk_id": "{}_{:04d}".format(result.run_id, c.chunk_index),
                "run_id": result.run_id,
                "chunk_index": c.chunk_index,
                "word_count": c.word_count,
                "char_count": c.char_count,
                "content_hash": c.content_hash,
                "quality_score": (
                    result.quality.score if result.quality else None
                ),
                "quality_flags": (
                    result.quality.flag_names if result.quality else []
                ),
                "has_overlap": c.has_overlap,
                "source_file": source_file,
                "language_detected": language_detected,
                "converter_used": converter_used,
                "cleaning_level": cleaning_level,
                "chunk_method": chunk_method,
                "created_at": result.completed_at,
                "metadata": json.dumps(c.metadata),
            }
            for c in result.chunking.chunks
        ]

    # ─────────────────────────────────────────
    # Stats
    # ─────────────────────────────────────────

    def get_stats(self) -> Dict:
        """إحصائيات التشغيل"""
        processed = max(1, self.stats["files_processed"])
        return {
            **self.stats,
            "success_rate": self.stats["files_success"] / processed,
            "rejection_rate": self.stats["files_rejected"] / processed,
            "error_rate": self.stats["files_error"] / processed,
        }

    # ─────────────────────────────────────────
    # Error Handling
    # ─────────────────────────────────────────

    def _finalize_error(
        self,
        run_id: str,
        source_path: str,
        stage: str,
        error: str,
        started: datetime,
        source_collection: str = "",
    ) -> PipelineResult:
        """بناء نتيجة خطأ + كتابة manifest + lineage"""
        self.stats["files_error"] += 1
        done = datetime.now(timezone.utc)
        result = PipelineResult(
            run_id=run_id,
            source_path=source_path,
            status="error",
            stage_reached=stage,
            error=error,
            started_at=started.isoformat(),
            completed_at=done.isoformat(),
            duration_seconds=(done - started).total_seconds(),
        )
        self._write_manifest(result, source_collection)
        self._write_lineage(result)
        return result
