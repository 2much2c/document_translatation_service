import os
from typing import Optional

class Settings:
    """애플리케이션 설정 클래스"""
    
    # OpenAI 설정
    OPENAI_API_KEY: Optional[str] = os.getenv('OPENAI_API_KEY')
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_MAX_TOKENS: int = 2000
    OPENAI_TEMPERATURE: float = 0.3
    
    # 파일 처리 설정
    MAX_FILE_SIZE: int = int(os.getenv('MAX_FILE_SIZE', '10485760'))  # 10MB
    ALLOWED_FILE_TYPES: list = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/bmp'
    ]
    
    # 번역 설정
    SUPPORTED_LANGUAGES: dict = {
        "ko": "한국어",
        "en": "영어",
        "ja": "일본어",
        "zh": "중국어",
        "es": "스페인어",
        "fr": "프랑스어",
        "de": "독일어",
        "ru": "러시아어"
    }
    
    # 요약 설정
    MIN_SENTENCES: int = 1
    MAX_SENTENCES: int = 10
    DEFAULT_SENTENCES: int = 3
    
    # API 설정
    API_TIMEOUT: int = 30
    CORS_ORIGINS: list = ["*"]
    
    @classmethod
    def validate(cls) -> bool:
        """설정 유효성 검사"""
        if not cls.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY가 설정되지 않았습니다.")
        return True
    
    @classmethod
    def get_openai_config(cls) -> dict:
        """OpenAI 설정 반환"""
        return {
            "api_key": cls.OPENAI_API_KEY,
            "model": cls.OPENAI_MODEL,
            "max_tokens": cls.OPENAI_MAX_TOKENS,
            "temperature": cls.OPENAI_TEMPERATURE
        }
