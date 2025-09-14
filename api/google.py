"""
Google OAuth 로그인 시작 API
"""
import os
import secrets
import urllib.parse

def handler(request):
    """Google OAuth 로그인 시작"""
    try:
        # Google OAuth 설정
        GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "https://dts-self.vercel.app/api/google/callback")
        GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
        
        if not GOOGLE_CLIENT_ID:
            return {
                "statusCode": 500,
                "body": "Google Client ID가 설정되지 않았습니다"
            }
        
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
        
        return {
            "statusCode": 302,
            "headers": {
                "Location": auth_url
            },
            "body": ""
        }
        
    except Exception as e:
        return {
            "statusCode": 500,
            "body": f"서버 오류: {str(e)}"
        }
