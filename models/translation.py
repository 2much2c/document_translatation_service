from dataclasses import dataclass
from typing import Optional, Dict, Any
from enum import Enum

class Language(Enum):
    KOREAN = "ko"
    ENGLISH = "en"
    JAPANESE = "ja"
    CHINESE = "zh"
    SPANISH = "es"
    FRENCH = "fr"
    GERMAN = "de"
    RUSSIAN = "ru"
    AUTO = "auto"

@dataclass
class TranslationRequest:
    """번역 요청 모델"""
    text: str
    source_language: Language
    target_language: Language
    
    def __post_init__(self):
        """유효성 검사"""
        if not self.text.strip():
            raise ValueError("번역할 텍스트가 비어있습니다.")
        
        if self.source_language == self.target_language:
            raise ValueError("원본 언어와 번역 언어가 같습니다.")

@dataclass
class TranslationResult:
    """번역 결과 모델"""
    original_text: str
    translated_text: str
    source_language: Language
    target_language: Language
    model: str = "gpt-4o"
    success: bool = True
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        return {
            "success": self.success,
            "original_text": self.original_text,
            "translated_text": self.translated_text,
            "source_language": self.source_language.value,
            "target_language": self.target_language.value,
            "model": self.model
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'TranslationResult':
        """딕셔너리에서 생성"""
        return cls(
            original_text=data["original_text"],
            translated_text=data["translated_text"],
            source_language=Language(data["source_language"]),
            target_language=Language(data["target_language"]),
            model=data.get("model", "gpt-4o"),
            success=data.get("success", True)
        )
