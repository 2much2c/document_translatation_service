from typing import Dict, Any
from models.document import Document
from services.file_processor import FileProcessorService
from views.error_handler import ErrorHandler

class DocumentController:
    """문서 컨트롤러 클래스"""
    
    def __init__(self):
        """문서 컨트롤러 초기화"""
        self.file_processor = FileProcessorService()
    
    def process_document(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """문서 처리"""
        try:
            # 요청 데이터 검증
            self._validate_document_request(data)
            
            # 문서 처리
            document = self.file_processor.process_document(
                file_data=data['file_data'],
                file_type=data['file_type'],
                file_name=data['file_name']
            )
            
            # 결과 반환
            return {
                "success": True,
                "file_name": document.file_name,
                "file_type": document.file_type.value,
                "extracted_text": document.extracted_text,
                "text_length": document.text_length
            }
            
        except Exception as e:
            return ErrorHandler.get_error_response(e)
    
    def _validate_document_request(self, data: Dict[str, Any]) -> None:
        """문서 요청 데이터 검증"""
        required_fields = ['file_data', 'file_type', 'file_name']
        
        # 필수 필드 검증
        for field in required_fields:
            if field not in data or not data[field]:
                raise ValueError(f"필수 필드가 누락되었습니다: {field}")
        
        # 파일 데이터 검증
        if not isinstance(data['file_data'], str):
            raise ValueError("파일 데이터는 문자열이어야 합니다.")
        
        # 파일 타입 검증
        valid_types = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'text/plain',
            'image/png',
            'image/jpeg',
            'image/gif',
            'image/bmp'
        ]
        
        if data['file_type'] not in valid_types:
            raise ValueError(f"지원하지 않는 파일 형식입니다: {data['file_type']}")
        
        # 파일명 검증
        if not data['file_name'] or len(data['file_name'].strip()) == 0:
            raise ValueError("파일명이 비어있습니다.")
