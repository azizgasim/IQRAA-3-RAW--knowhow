"""
IQRA-12 Vertex AI Client
عميل Vertex AI للـ Embeddings و LLM
"""
from typing import Optional
import structlog

try:
    from google.cloud import aiplatform
    from vertexai.language_models import TextEmbeddingModel
    from vertexai.generative_models import GenerativeModel
    VERTEX_AVAILABLE = True
except ImportError:
    VERTEX_AVAILABLE = False

from .config import Config

logger = structlog.get_logger()


class VertexAIClient:
    """
    عميل Vertex AI للتكامل مع نماذج Google
    
    يوفر:
    - Text Embeddings (تحويل النص لمتجهات)
    - Generative AI (توليد النصوص)
    """
    
    def __init__(self, config: Optional[Config] = None):
        self.config = config or Config.from_env()
        self.logger = logger.bind(component="VertexAIClient")
        self._initialized = False
        self._embedding_model = None
        self._generative_model = None
        
    def _ensure_initialized(self):
        """تهيئة Vertex AI عند الحاجة"""
        if self._initialized:
            return
            
        if not VERTEX_AVAILABLE:
            raise ImportError("google-cloud-aiplatform not installed")
            
        aiplatform.init(
            project=self.config.project_id,
            location=self.config.location,
        )
        self._initialized = True
        self.logger.info("vertex_ai_initialized", project=self.config.project_id)
    
    def _get_embedding_model(self) -> "TextEmbeddingModel":
        """الحصول على نموذج الـ Embeddings"""
        if self._embedding_model is None:
            self._ensure_initialized()
            self._embedding_model = TextEmbeddingModel.from_pretrained("text-embedding-004")
        return self._embedding_model
    
    def _get_generative_model(self) -> "GenerativeModel":
        """الحصول على النموذج التوليدي"""
        if self._generative_model is None:
            self._ensure_initialized()
            self._generative_model = GenerativeModel(self.config.default_model)
        return self._generative_model
    
    async def get_embedding(self, text: str) -> list[float]:
        """
        تحويل نص إلى متجه
        
        Args:
            text: النص المراد تحويله
            
        Returns:
            قائمة الأرقام العشرية (768 بُعد)
        """
        self.logger.info("get_embedding_started", text_length=len(text))
        
        try:
            model = self._get_embedding_model()
            embeddings = model.get_embeddings([text])
            
            if embeddings and len(embeddings) > 0:
                return embeddings[0].values
            return []
            
        except Exception as e:
            self.logger.error("get_embedding_failed", error=str(e))
            raise
    
    async def get_embeddings_batch(self, texts: list[str]) -> list[list[float]]:
        """
        تحويل مجموعة نصوص إلى متجهات
        
        Args:
            texts: قائمة النصوص
            
        Returns:
            قائمة المتجهات
        """
        self.logger.info("get_embeddings_batch_started", count=len(texts))
        
        try:
            model = self._get_embedding_model()
            
            # Batch in groups of 5 (API limit)
            all_embeddings = []
            batch_size = 5
            
            for i in range(0, len(texts), batch_size):
                batch = texts[i:i + batch_size]
                embeddings = model.get_embeddings(batch)
                all_embeddings.extend([e.values for e in embeddings])
            
            return all_embeddings
            
        except Exception as e:
            self.logger.error("get_embeddings_batch_failed", error=str(e))
            raise
    
    async def generate_text(
        self,
        prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        """
        توليد نص باستخدام Gemini
        
        Args:
            prompt: النص التوجيهي
            temperature: درجة العشوائية
            max_tokens: الحد الأقصى للرموز
            
        Returns:
            النص المولد
        """
        self.logger.info("generate_text_started", prompt_length=len(prompt))
        
        try:
            model = self._get_generative_model()
            
            generation_config = {
                "temperature": temperature or self.config.temperature,
                "max_output_tokens": max_tokens or self.config.max_tokens,
            }
            
            response = model.generate_content(
                prompt,
                generation_config=generation_config,
            )
            
            return response.text
            
        except Exception as e:
            self.logger.error("generate_text_failed", error=str(e))
            raise
    
    async def analyze_text(
        self,
        text: str,
        task: str,
        output_format: str = "json",
    ) -> dict:
        """
        تحليل نص باستخدام Gemini
        
        Args:
            text: النص المراد تحليله
            task: نوع التحليل (entities, relations, summary, etc.)
            output_format: صيغة المخرجات
            
        Returns:
            نتيجة التحليل
        """
        prompt = f"""
أنت محلل نصوص متخصص في التراث الإسلامي.

المهمة: {task}

النص:
{text}

أجب بصيغة {output_format} فقط.
"""
        
        response = await self.generate_text(prompt, temperature=0.1)
        
        if output_format == "json":
            import json
            try:
                return json.loads(response)
            except json.JSONDecodeError:
                return {"raw_response": response}
        
        return {"response": response}
