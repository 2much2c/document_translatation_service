"""
Google OAuth 콜백 처리 API
"""
import os
import requests
import json
from datetime import datetime, timedelta
import jwt

def handler(request):
    """Google OAuth 콜백 처리"""
    try:
        # Google OAuth 설정
        GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
        GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "https://dts-self.vercel.app/api/google/callback")
        JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default-secret-key")
        
        if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
            return {
                "statusCode": 500,
                "body": "Google OAuth 설정이 완료되지 않았습니다"
            }
        
        GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
        GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
        
        # URL에서 쿼리 파라미터 추출
        query_params = request.get("queryStringParameters") or {}
        code = query_params.get("code")
        state = query_params.get("state")
        
        if not code:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "인증 코드가 없습니다"})
            }
        
        # 1. 인증 코드로 액세스 토큰 요청
        token_data = {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": GOOGLE_REDIRECT_URI
        }
        
        token_response = requests.post(GOOGLE_TOKEN_URL, data=token_data)
        token_response.raise_for_status()
        token_info = token_response.json()
        
        access_token = token_info.get("access_token")
        if not access_token:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "액세스 토큰을 받을 수 없습니다"})
            }
        
        # 2. 사용자 정보 조회
        user_info_response = requests.get(
            GOOGLE_USER_INFO_URL,
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_info_response.raise_for_status()
        user_info = user_info_response.json()
        
        # 3. JWT 토큰 생성
        user_data = {
            "id": user_info["id"],
            "email": user_info["email"],
            "name": user_info["name"],
            "picture": user_info.get("picture"),
            "provider": "google",
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(days=7)
        }
        
        jwt_token = jwt.encode(user_data, JWT_SECRET_KEY, algorithm="HS256")
        
        # 4. 프론트엔드로 리다이렉트 (토큰 포함)
        frontend_url = f"https://dts-self.vercel.app/?token={jwt_token}"
        
        return {
            "statusCode": 302,
            "headers": {
                "Location": frontend_url
            },
            "body": ""
        }
        
    except requests.RequestException as e:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": f"Google OAuth 오류: {str(e)}"})
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": f"서버 오류: {str(e)}"})
        }