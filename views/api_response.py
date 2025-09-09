from http.server import BaseHTTPRequestHandler
import json
from typing import Any, Dict, Optional

class APIResponseHandler:
    """API 응답 처리 클래스"""
    
    @staticmethod
    def send_success_response(handler: BaseHTTPRequestHandler, data: Any, status_code: int = 200):
        """성공 응답 전송"""
        handler.send_response(status_code)
        handler.send_header('Content-type', 'application/json; charset=utf-8')
        handler.send_header('Access-Control-Allow-Origin', '*')
        handler.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        handler.send_header('Access-Control-Allow-Headers', 'Content-Type')
        handler.end_headers()
        
        if isinstance(data, dict):
            response_data = data
        else:
            response_data = data.to_dict() if hasattr(data, 'to_dict') else {"data": data}
        
        handler.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
    
    @staticmethod
    def send_error_response(handler: BaseHTTPRequestHandler, message: str, status_code: int = 500):
        """오류 응답 전송"""
        handler.send_response(status_code)
        handler.send_header('Content-type', 'application/json; charset=utf-8')
        handler.send_header('Access-Control-Allow-Origin', '*')
        handler.end_headers()
        
        error_data = {
            "success": False,
            "error": message,
            "status_code": status_code
        }
        
        handler.wfile.write(json.dumps(error_data, ensure_ascii=False).encode('utf-8'))
    
    @staticmethod
    def send_cors_response(handler: BaseHTTPRequestHandler):
        """CORS 옵션 응답 전송"""
        handler.send_response(200)
        handler.send_header('Access-Control-Allow-Origin', '*')
        handler.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        handler.send_header('Access-Control-Allow-Headers', 'Content-Type')
        handler.end_headers()
    
    @staticmethod
    def parse_json_request(handler: BaseHTTPRequestHandler) -> Dict[str, Any]:
        """JSON 요청 파싱"""
        try:
            content_length = int(handler.headers['Content-Length'])
            post_data = handler.rfile.read(content_length)
            return json.loads(post_data.decode('utf-8'))
        except Exception as e:
            raise ValueError(f"JSON 파싱 오류: {str(e)}")
    
    @staticmethod
    def validate_required_fields(data: Dict[str, Any], required_fields: list) -> None:
        """필수 필드 검증"""
        missing_fields = [field for field in required_fields if field not in data or not data[field]]
        if missing_fields:
            raise ValueError(f"필수 필드가 누락되었습니다: {', '.join(missing_fields)}")
    
    @staticmethod
    def create_success_response(data: Any, message: str = "성공") -> Dict[str, Any]:
        """성공 응답 데이터 생성"""
        if isinstance(data, dict):
            return {
                "success": True,
                "message": message,
                **data
            }
        else:
            return {
                "success": True,
                "message": message,
                "data": data.to_dict() if hasattr(data, 'to_dict') else data
            }
    
    @staticmethod
    def create_error_response(message: str, error_code: str = None) -> Dict[str, Any]:
        """오류 응답 데이터 생성"""
        response = {
            "success": False,
            "error": message
        }
        if error_code:
            response["error_code"] = error_code
        return response
