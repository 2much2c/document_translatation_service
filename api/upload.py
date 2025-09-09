from http.server import BaseHTTPRequestHandler
import json
import os
import base64
import tempfile
import PyPDF2
from docx import Document
import pytesseract
from PIL import Image
import io
import traceback

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # 요청 데이터 읽기
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # 파일 데이터 확인
            file_data = data.get('file_data', '')
            file_type = data.get('file_type', '')
            file_name = data.get('file_name', 'unknown')
            
            if not file_data:
                self.send_error_response(400, "파일 데이터가 필요합니다.")
                return
            
            # Base64 디코딩
            try:
                file_bytes = base64.b64decode(file_data)
            except Exception as e:
                self.send_error_response(400, "잘못된 파일 데이터입니다.")
                return
            
            # 파일 타입에 따른 텍스트 추출
            extracted_text = self.extract_text_from_file(file_bytes, file_type)
            
            if not extracted_text:
                self.send_error_response(400, "텍스트를 추출할 수 없습니다.")
                return
            
            # 응답 데이터
            response_data = {
                "success": True,
                "file_name": file_name,
                "file_type": file_type,
                "extracted_text": extracted_text,
                "text_length": len(extracted_text)
            }
            
            self.send_success_response(response_data)
            
        except Exception as e:
            self.send_error_response(500, f"파일 처리 중 오류가 발생했습니다: {str(e)}")
    
    def extract_text_from_file(self, file_bytes, file_type):
        """파일 타입에 따라 텍스트 추출"""
        try:
            if file_type == 'application/pdf':
                return self.extract_from_pdf(file_bytes)
            elif file_type in ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']:
                return self.extract_from_docx(file_bytes)
            elif file_type.startswith('image/'):
                return self.extract_from_image(file_bytes)
            elif file_type == 'text/plain':
                return file_bytes.decode('utf-8')
            else:
                return None
        except Exception as e:
            print(f"텍스트 추출 오류: {e}")
            return None
    
    def extract_from_pdf(self, file_bytes):
        """PDF에서 텍스트 추출"""
        try:
            pdf_file = io.BytesIO(file_bytes)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            print(f"PDF 추출 오류: {e}")
            return None
    
    def extract_from_docx(self, file_bytes):
        """DOCX에서 텍스트 추출"""
        try:
            doc_file = io.BytesIO(file_bytes)
            doc = Document(doc_file)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            print(f"DOCX 추출 오류: {e}")
            return None
    
    def extract_from_image(self, file_bytes):
        """이미지에서 OCR로 텍스트 추출"""
        try:
            image = Image.open(io.BytesIO(file_bytes))
            # OCR 실행
            text = pytesseract.image_to_string(image, lang='kor+eng')
            return text.strip()
        except Exception as e:
            print(f"이미지 OCR 오류: {e}")
            return None
    
    def send_success_response(self, data):
        self.send_response(200)
        self.send_header('Content-type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
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
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
