from http.server import BaseHTTPRequestHandler
from controllers.document_controller import DocumentController
from views.api_response import APIResponseHandler

class handler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.document_controller = DocumentController()
        super().__init__(*args, **kwargs)
    
    def do_POST(self):
        try:
            # 요청 데이터 파싱
            data = APIResponseHandler.parse_json_request(self)
            
            # 문서 처리
            result = self.document_controller.process_document(data)
            
            # 응답 전송
            if result.get('success'):
                APIResponseHandler.send_success_response(self, result)
            else:
                APIResponseHandler.send_error_response(
                    self, 
                    result.get('error', '문서 처리 중 오류가 발생했습니다.'),
                    result.get('status_code', 500)
                )
                
        except Exception as e:
            APIResponseHandler.send_error_response(self, f"문서 처리 중 오류가 발생했습니다: {str(e)}")
    
    def do_OPTIONS(self):
        APIResponseHandler.send_cors_response(self)