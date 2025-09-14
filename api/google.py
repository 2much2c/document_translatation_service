"""
Google OAuth 로그인 시작 API
"""
import os
import secrets
import urllib.parse
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Google OAuth 설정
            GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
            GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "https://dts-self.vercel.app/api/google/callback")
            GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
            
            if not GOOGLE_CLIENT_ID:
                self.send_response(500)
                self.send_header('Content-type', 'text/plain')
                self.end_headers()
                self.wfile.write(b'Google Client ID가 설정되지 않았습니다')
                return
            
            state = secrets.token_urlsafe(32)
            
            params = {
                "client_id": GOOGLE_CLIENT_ID,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "scope": "openid email profile",
                "response_type": "code",
                "state": state,
                "access_type": "offline",
                "prompt": "consent"
            }
            
            # URL 인코딩
            query_string = urllib.parse.urlencode(params)
            auth_url = f"{GOOGLE_AUTH_URL}?{query_string}"
            
            # 리다이렉트 응답
            self.send_response(302)
            self.send_header('Location', auth_url)
            self.end_headers()
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(f'서버 오류: {str(e)}'.encode())
