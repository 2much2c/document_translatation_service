from dataclasses import dataclass
from typing import Optional, Dict, Any
from enum import Enum

class SummaryMethod(Enum):
    GPT_DETAILED = "gpt"
    GPT_BRIEF = "brief"

@dataclass
class SummaryRequest:
    """요약 요청 모델"""
    text: str
    method: SummaryMethod
    sentences_count: int
    
    def __post_init__(self):
        """유효성 검사"""
        if not self.text.strip():
            raise ValueError("요약할 텍스트가 비어있습니다.")
        
        if self.sentences_count < 1 or self.sentences_count > 10:
            raise ValueError("문장 수는 1-10 사이여야 합니다.")

@dataclass
class SummaryResult:
    """요약 결과 모델"""
    original_text: str
    summary: str
    method: SummaryMethod
    sentences_count: int
    original_length: int
    summary_length: int
    model: str = "gpt-4o"
    success: bool = True
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        return {
            "success": self.success,
            "original_text": self.original_text,
            "summary": self.summary,
            "method": self.method.value,
            "sentences_count": self.sentences_count,
            "original_length": self.original_length,
            "summary_length": self.summary_length,
            "model": self.model
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SummaryResult':
        """딕셔너리에서 생성"""
        return cls(
            original_text=data["original_text"],
            summary=data["summary"],
            method=SummaryMethod(data["method"]),
            sentences_count=data["sentences_count"],
            original_length=data["original_length"],
            summary_length=data["summary_length"],
            model=data.get("model", "gpt-4o"),
            success=data.get("success", True)
        )
