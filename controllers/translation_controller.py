from typing import Dict, Any
from models.translation import TranslationRequest, TranslationResult, Language
from services.openai_service import OpenAIService
from views.error_handler import ErrorHandler

class TranslationController:
    """번역 컨트롤러 클래스"""
    
    def __init__(self):
        """번역 컨트롤러 초기화"""
        self.openai_service = OpenAIService()
    
    def translate_text(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """텍스트 번역 처리"""
        try:
            # 요청 데이터 검증
            self._validate_translation_request(data)
            
            # TranslationRequest 객체 생성
            request = TranslationRequest(
                text=data['text'],
                source_language=Language(data.get('source_lang', 'auto')),
                target_language=Language(data['target_lang'])
            )
            
            # 번역 실행
            result = self.openai_service.translate_text(request)
            
            # 결과 반환
            return {
                "success": True,
                "original_text": result.original_text,
                "translated_text": result.translated_text,
                "source_language": result.source_language.value,
                "target_language": result.target_language.value,
                "model": result.model
            }
            
        except Exception as e:
            return ErrorHandler.get_error_response(e)
    
    def get_supported_languages(self) -> Dict[str, Any]:
        """지원하는 언어 목록 반환"""
        try:
            languages = self.openai_service.get_supported_languages()
            return {
                "success": True,
                "supported_languages": languages
            }
        except Exception as e:
            return ErrorHandler.get_error_response(e)
    
    def _validate_translation_request(self, data: Dict[str, Any]) -> None:
        """번역 요청 데이터 검증"""
        required_fields = ['text', 'target_lang']
        
        # 필수 필드 검증
        for field in required_fields:
            if field not in data or not data[field]:
                raise ValueError(f"필수 필드가 누락되었습니다: {field}")
        
        # 텍스트 길이 검증
        if len(data['text'].strip()) == 0:
            raise ValueError("번역할 텍스트가 비어있습니다.")
        
        # 언어 코드 검증
        valid_languages = list(self.openai_service.get_supported_languages().keys()) + ['auto']
        if data['target_lang'] not in valid_languages:
            raise ValueError(f"지원하지 않는 대상 언어입니다: {data['target_lang']}")
        
        if 'source_lang' in data and data['source_lang'] != 'auto' and data['source_lang'] not in valid_languages:
            raise ValueError(f"지원하지 않는 원본 언어입니다: {data['source_lang']}")
        
        # 원본과 대상 언어가 같은지 검증
        if data.get('source_lang', 'auto') == data['target_lang']:
            raise ValueError("원본 언어와 번역 언어가 같습니다.")
