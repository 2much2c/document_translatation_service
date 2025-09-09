from http.server import BaseHTTPRequestHandler
import json
import os
from deep_translator import GoogleTranslator
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
            target_lang = data.get('target_lang', 'ko')
            source_lang = data.get('source_lang', 'auto')
            
            if not text:
                self.send_error_response(400, "텍스트가 필요합니다.")
                return
            
            # 번역 실행
            translator = GoogleTranslator(source=source_lang, target=target_lang)
            translated_text = translator.translate(text)
            
            # 응답 데이터
            response_data = {
                "success": True,
                "original_text": text,
                "translated_text": translated_text,
                "source_language": source_lang,
                "target_language": target_lang
            }
            
            self.send_success_response(response_data)
            
        except Exception as e:
            self.send_error_response(500, f"번역 중 오류가 발생했습니다: {str(e)}")
    
    def do_GET(self):
        # 지원하는 언어 목록 반환
        supported_languages = {
            "ko": "한국어",
            "en": "영어", 
            "ja": "일본어",
            "zh": "중국어",
            "es": "스페인어",
            "fr": "프랑스어",
            "de": "독일어",
            "ru": "러시아어"
        }
        
        response_data = {
            "success": True,
            "supported_languages": supported_languages
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
