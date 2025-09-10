"""
JWT 토큰 검증 API
"""
import os
import jwt
from fastapi import HTTPException
from pydantic import BaseModel

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default-secret-key")

class TokenRequest(BaseModel):
    token: str

def handler(request):
    """JWT 토큰 검증"""
    try:
        # 요청 본문에서 토큰 추출
        body = request.json()
        token = body.get("token")
        
        if not token:
            raise HTTPException(status_code=400, detail="토큰이 필요합니다")
        
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")
