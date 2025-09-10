"""
Google OAuth 인증 API
"""
import os
import json
import requests
from datetime import datetime, timedelta
import jwt
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
import secrets

router = APIRouter()

# Google OAuth 설정
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "https://dts-self.vercel.app/api/auth/google/callback")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", secrets.token_urlsafe(32))

# Google OAuth URLs
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

class GoogleAuthRequest(BaseModel):
    code: str
    state: str

class UserInfo(BaseModel):
    id: str
    email: str
    name: str
    picture: str = None

@router.get("/google")
async def google_login():
    """Google OAuth 로그인 시작"""
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
    
    auth_url = f"{GOOGLE_AUTH_URL}?{'&'.join([f'{k}={v}' for k, v in params.items()])}"
    
    return RedirectResponse(url=auth_url)

@router.get("/google/callback")
async def google_callback(code: str, state: str):
    """Google OAuth 콜백 처리"""
    try:
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
            raise HTTPException(status_code=400, detail="액세스 토큰을 받을 수 없습니다")
        
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
        return RedirectResponse(url=frontend_url)
        
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Google OAuth 오류: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")

@router.post("/verify")
async def verify_token(token: str):
    """JWT 토큰 검증"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        return {
            "valid": True,
            "user": {
                "id": payload["id"],
                "email": payload["email"],
                "name": payload["name"],
                "picture": payload.get("picture"),
                "provider": payload["provider"]
            }
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="토큰이 만료되었습니다")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다")

@router.post("/logout")
async def logout():
    """로그아웃"""
    return {"message": "로그아웃되었습니다"}
