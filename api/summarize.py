from http.server import BaseHTTPRequestHandler
import json
import os
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
from sumy.summarizers.text_rank import TextRankSummarizer
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
            method = data.get('method', 'lsa')  # lsa 또는 textrank
            sentences_count = data.get('sentences_count', 3)
            
            if not text:
                self.send_error_response(400, "텍스트가 필요합니다.")
                return
            
            # 텍스트 파싱
            parser = PlaintextParser.from_string(text, Tokenizer("korean"))
            
            # 요약 방법 선택
            if method == 'textrank':
                summarizer = TextRankSummarizer()
            else:
                summarizer = LsaSummarizer()
            
            # 요약 실행
            summary_sentences = summarizer(parser.document, sentences_count)
            summary_text = ' '.join([str(sentence) for sentence in summary_sentences])
            
            # 응답 데이터
            response_data = {
                "success": True,
                "original_text": text,
                "summary": summary_text,
                "method": method,
                "sentences_count": len(summary_sentences),
                "original_length": len(text.split()),
                "summary_length": len(summary_text.split())
            }
            
            self.send_success_response(response_data)
            
        except Exception as e:
            self.send_error_response(500, f"요약 중 오류가 발생했습니다: {str(e)}")
    
    def do_GET(self):
        # 지원하는 요약 방법 반환
        methods = {
            "lsa": "LSA (Latent Semantic Analysis) - 빠르고 효율적",
            "textrank": "TextRank - 페이지랭크 알고리즘 기반"
        }
        
        response_data = {
            "success": True,
            "methods": methods
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
