"""
Claude Opus 4 Client - Fixed .env loading
"""

import os
from pathlib import Path
from anthropic import AsyncAnthropic


class ClaudeClient:
    """عميل Claude Opus 4"""
    
    def __init__(self):
        # تحميل .env يدوياً
        env_file = Path("/home/user/iqraa-12-platform/.env")
        
        if env_file.exists():
            with open(env_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and '=' in line and not line.startswith('#'):
                        key, value = line.split('=', 1)
                        os.environ[key] = value
        
        api_key = os.getenv("ANTHROPIC_API_KEY")
        
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY غير موجود")
        
        if not api_key.startswith("sk-ant-"):
            raise ValueError("المفتاح يجب أن يبدأ بـ sk-ant-")
        
        self.client = AsyncAnthropic(api_key=api_key)
        self.model = os.getenv("ANTHROPIC_MODEL", "claude-opus-4-20250514")
        
        print(f"✅ Claude Opus 4 جاهز (Model: {self.model})")
    
    async def generate(self, prompt: str, system: str = "", max_tokens: int = 4000) -> dict:
        """توليد نص"""
        
        try:
            message = await self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=0.7,
                system=system if system else "أنت باحث أكاديمي متخصص في التراث الإسلامي.",
                messages=[{"role": "user", "content": prompt}]
            )
            
            return {
                "text": message.content[0].text,
                "model": self.model,
                "usage": {
                    "input_tokens": message.usage.input_tokens,
                    "output_tokens": message.usage.output_tokens
                },
                "stop_reason": message.stop_reason
            }
            
        except Exception as e:
            print(f"❌ Claude error: {e}")
            return {"text": "", "error": str(e)}

