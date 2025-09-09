from typing import Dict, Any
import traceback
import logging

class ErrorHandler:
    """에러 처리 클래스"""
    
    @staticmethod
    def handle_validation_error(error: ValueError) -> Dict[str, Any]:
        """유효성 검사 오류 처리"""
        return {
            "success": False,
            "error": str(error),
            "error_type": "validation_error",
            "status_code": 400
        }
    
    @staticmethod
    def handle_service_error(error: Exception) -> Dict[str, Any]:
        """서비스 오류 처리"""
        return {
            "success": False,
            "error": str(error),
            "error_type": "service_error",
            "status_code": 500
        }
    
    @staticmethod
    def handle_openai_error(error: Exception) -> Dict[str, Any]:
        """OpenAI API 오류 처리"""
        error_message = str(error)
        if "rate_limit" in error_message.lower():
            return {
                "success": False,
                "error": "API 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.",
                "error_type": "rate_limit_error",
                "status_code": 429
            }
        elif "invalid_api_key" in error_message.lower():
            return {
                "success": False,
                "error": "API 키가 유효하지 않습니다.",
                "error_type": "auth_error",
                "status_code": 401
            }
        else:
            return {
                "success": False,
                "error": f"AI 서비스 오류: {error_message}",
                "error_type": "ai_service_error",
                "status_code": 500
            }
    
    @staticmethod
    def handle_file_processing_error(error: Exception) -> Dict[str, Any]:
        """파일 처리 오류 처리"""
        return {
            "success": False,
            "error": f"파일 처리 오류: {str(error)}",
            "error_type": "file_processing_error",
            "status_code": 400
        }
    
    @staticmethod
    def handle_unexpected_error(error: Exception) -> Dict[str, Any]:
        """예상치 못한 오류 처리"""
        # 로깅 (실제 환경에서는 로그 파일에 저장)
        logging.error(f"Unexpected error: {str(error)}")
        logging.error(traceback.format_exc())
        
        return {
            "success": False,
            "error": "서버 내부 오류가 발생했습니다.",
            "error_type": "internal_error",
            "status_code": 500
        }
    
    @staticmethod
    def get_error_response(error: Exception) -> Dict[str, Any]:
        """오류 타입에 따른 적절한 응답 반환"""
        error_type = type(error).__name__
        
        if isinstance(error, ValueError):
            return ErrorHandler.handle_validation_error(error)
        elif "OpenAI" in str(type(error)) or "openai" in str(error).lower():
            return ErrorHandler.handle_openai_error(error)
        elif "file" in str(error).lower() or "File" in str(type(error)):
            return ErrorHandler.handle_file_processing_error(error)
        else:
            return ErrorHandler.handle_unexpected_error(error)
