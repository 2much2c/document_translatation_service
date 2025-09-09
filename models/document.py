from dataclasses import dataclass
from typing import Optional, Dict, Any
from enum import Enum

class FileType(Enum):
    PDF = "application/pdf"
    DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    DOC = "application/msword"
    TXT = "text/plain"
    PNG = "image/png"
    JPG = "image/jpeg"
    JPEG = "image/jpeg"
    GIF = "image/gif"
    BMP = "image/bmp"

@dataclass
class Document:
    """문서 모델 클래스"""
    file_name: str
    file_type: FileType
    file_size: int
    file_data: bytes
    extracted_text: Optional[str] = None
    text_length: Optional[int] = None
    
    def __post_init__(self):
        """초기화 후 처리"""
        if self.extracted_text:
            self.text_length = len(self.extracted_text.split())
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환"""
        return {
            "file_name": self.file_name,
            "file_type": self.file_type.value,
            "file_size": self.file_size,
            "extracted_text": self.extracted_text,
            "text_length": self.text_length
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Document':
        """딕셔너리에서 생성"""
        return cls(
            file_name=data["file_name"],
            file_type=FileType(data["file_type"]),
            file_size=data["file_size"],
            file_data=data["file_data"],
            extracted_text=data.get("extracted_text"),
            text_length=data.get("text_length")
        )
