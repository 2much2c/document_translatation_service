from http.server import BaseHTTPRequestHandler
from controllers.summary_controller import SummaryController
from views.api_response import APIResponseHandler

class handler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.summary_controller = SummaryController()
        super().__init__(*args, **kwargs)
    
    def do_POST(self):
        try:
            # 요청 데이터 파싱
            data = APIResponseHandler.parse_json_request(self)
            
            # 요약 처리
            result = self.summary_controller.summarize_text(data)
            
            # 응답 전송
            if result.get('success'):
                APIResponseHandler.send_success_response(self, result)
            else:
                APIResponseHandler.send_error_response(
                    self, 
                    result.get('error', '요약 처리 중 오류가 발생했습니다.'),
                    result.get('status_code', 500)
                )
                
        except Exception as e:
            APIResponseHandler.send_error_response(self, f"요약 중 오류가 발생했습니다: {str(e)}")
    
    def do_GET(self):
        try:
            # 지원하는 요약 방법 반환
            result = self.summary_controller.get_summary_methods()
            
            if result.get('success'):
                APIResponseHandler.send_success_response(self, result)
            else:
                APIResponseHandler.send_error_response(
                    self,
                    result.get('error', '요약 방법 목록을 가져오는 중 오류가 발생했습니다.'),
                    result.get('status_code', 500)
                )
                
        except Exception as e:
            APIResponseHandler.send_error_response(self, f"요약 방법 조회 중 오류가 발생했습니다: {str(e)}")
    
    def do_OPTIONS(self):
        APIResponseHandler.send_cors_response(self)