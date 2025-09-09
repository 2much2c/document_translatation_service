from typing import Dict, Any
from models.summary import SummaryRequest, SummaryResult, SummaryMethod
from services.openai_service import OpenAIService
from views.error_handler import ErrorHandler

class SummaryController:
    """요약 컨트롤러 클래스"""
    
    def __init__(self):
        """요약 컨트롤러 초기화"""
        self.openai_service = OpenAIService()
    
    def summarize_text(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """텍스트 요약 처리"""
        try:
            # 요청 데이터 검증
            self._validate_summary_request(data)
            
            # SummaryRequest 객체 생성
            request = SummaryRequest(
                text=data['text'],
                method=SummaryMethod(data.get('method', 'gpt')),
                sentences_count=int(data.get('sentences_count', 3))
            )
            
            # 요약 실행
            result = self.openai_service.summarize_text(request)
            
            # 결과 반환
            return {
                "success": True,
                "original_text": result.original_text,
                "summary": result.summary,
                "method": result.method.value,
                "sentences_count": result.sentences_count,
                "original_length": result.original_length,
                "summary_length": result.summary_length,
                "model": result.model
            }
            
        except Exception as e:
            return ErrorHandler.get_error_response(e)
    
    def get_summary_methods(self) -> Dict[str, Any]:
        """지원하는 요약 방법 반환"""
        try:
            methods = self.openai_service.get_summary_methods()
            return {
                "success": True,
                "methods": methods
            }
        except Exception as e:
            return ErrorHandler.get_error_response(e)
    
    def _validate_summary_request(self, data: Dict[str, Any]) -> None:
        """요약 요청 데이터 검증"""
        required_fields = ['text']
        
        # 필수 필드 검증
        for field in required_fields:
            if field not in data or not data[field]:
                raise ValueError(f"필수 필드가 누락되었습니다: {field}")
        
        # 텍스트 길이 검증
        if len(data['text'].strip()) == 0:
            raise ValueError("요약할 텍스트가 비어있습니다.")
        
        # 요약 방법 검증
        valid_methods = ['gpt', 'brief']
        method = data.get('method', 'gpt')
        if method not in valid_methods:
            raise ValueError(f"지원하지 않는 요약 방법입니다: {method}")
        
        # 문장 수 검증
        sentences_count = data.get('sentences_count', 3)
        try:
            sentences_count = int(sentences_count)
            if sentences_count < 1 or sentences_count > 10:
                raise ValueError("문장 수는 1-10 사이여야 합니다.")
        except (ValueError, TypeError):
            raise ValueError("문장 수는 숫자여야 합니다.")
