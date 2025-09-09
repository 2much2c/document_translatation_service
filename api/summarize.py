from http.server import BaseHTTPRequestHandler
import json
import os
from openai import OpenAI
import traceback

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # 요청 데이터 읽기
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # 필수 파라미터 확인
            text = data.get('text', '')
            method = data.get('method', 'gpt')  # gpt 또는 brief
            sentences_count = data.get('sentences_count', 3)
            
            if not text:
                self.send_error_response(400, "텍스트가 필요합니다.")
                return
            
            # OpenAI API 키 확인
            api_key = os.getenv('OPENAI_API_KEY')
            if not api_key:
                self.send_error_response(500, "OpenAI API 키가 설정되지 않았습니다.")
                return
            
            # OpenAI 클라이언트 초기화
            client = OpenAI(api_key=api_key)
            
            # 요약 방법에 따른 프롬프트 설정
            if method == 'brief':
                prompt = f"다음 텍스트를 {sentences_count}문장으로 간단히 요약해주세요. 핵심 내용만 포함하여 요약해주세요:\n\n{text}"
            else:  # gpt
                prompt = f"다음 텍스트를 {sentences_count}문장으로 상세하고 정확하게 요약해주세요. 중요한 정보와 맥락을 모두 포함하여 요약해주세요:\n\n{text}"
            
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "당신은 전문 요약가입니다. 주어진 텍스트를 요청된 문장 수로 정확하고 명확하게 요약합니다."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            summary_text = response.choices[0].message.content.strip()
            
            # 응답 데이터
            response_data = {
                "success": True,
                "original_text": text,
                "summary": summary_text,
                "method": method,
                "sentences_count": sentences_count,
                "original_length": len(text.split()),
                "summary_length": len(summary_text.split()),
                "model": "gpt-4o"
            }
            
            self.send_success_response(response_data)
            
        except Exception as e:
            self.send_error_response(500, f"요약 중 오류가 발생했습니다: {str(e)}")
    
    def do_GET(self):
        # 지원하는 요약 방법 반환
        methods = {
            "gpt": "GPT 기반 상세 요약 - 맥락과 세부사항 포함",
            "brief": "GPT 기반 간단 요약 - 핵심 내용만"
        }
        
        response_data = {
            "success": True,
            "methods": methods,
            "model": "gpt-4o"
        }
        
        self.send_success_response(response_data)
    
    def send_success_response(self, data):
        self.send_response(200)
        self.send_header('Content-type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
    
    def send_error_response(self, status_code, message):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        error_data = {
            "success": False,
            "error": message
        }
        self.wfile.write(json.dumps(error_data, ensure_ascii=False).encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
