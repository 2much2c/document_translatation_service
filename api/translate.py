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
            target_lang = data.get('target_lang', 'ko')
            source_lang = data.get('source_lang', 'auto')
            
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
            
            # 언어 코드를 언어명으로 변환
            lang_names = {
                "ko": "한국어",
                "en": "영어",
                "ja": "일본어", 
                "zh": "중국어",
                "es": "스페인어",
                "fr": "프랑스어",
                "de": "독일어",
                "ru": "러시아어"
            }
            
            target_lang_name = lang_names.get(target_lang, target_lang)
            source_lang_name = lang_names.get(source_lang, source_lang) if source_lang != 'auto' else '자동 감지'
            
            # GPT를 사용한 번역
            prompt = f"다음 텍스트를 {target_lang_name}로 번역해주세요. 원문의 의미와 뉘앙스를 정확히 전달하되 자연스러운 {target_lang_name}로 번역해주세요:\n\n{text}"
            
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": f"당신은 전문 번역가입니다. 주어진 텍스트를 정확하고 자연스럽게 {target_lang_name}로 번역합니다."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.3
            )
            
            translated_text = response.choices[0].message.content.strip()
            
            # 응답 데이터
            response_data = {
                "success": True,
                "original_text": text,
                "translated_text": translated_text,
                "source_language": source_lang,
                "target_language": target_lang,
                "model": "gpt-4o"
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
            "supported_languages": supported_languages,
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
