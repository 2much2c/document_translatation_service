"""
JWT 토큰 검증 API
"""
import os
import json
import jwt

def handler(request):
    """JWT 토큰 검증"""
    try:
        JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default-secret-key")
        
        # 요청 본문에서 토큰 추출
        body = json.loads(request.get("body") or "{}")
        token = body.get("token")
        
        if not token:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "토큰이 필요합니다"})
            }
        
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        return {
            "statusCode": 200,
            "body": json.dumps({
                "valid": True,
                "user": {
                    "id": payload["id"],
                    "email": payload["email"],
                    "name": payload["name"],
                    "picture": payload.get("picture"),
                    "provider": payload["provider"]
                }
            })
        }
    except jwt.ExpiredSignatureError:
        return {
            "statusCode": 401,
            "body": json.dumps({"error": "토큰이 만료되었습니다"})
        }
    except jwt.InvalidTokenError:
        return {
            "statusCode": 401,
            "body": json.dumps({"error": "유효하지 않은 토큰입니다"})
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": f"서버 오류: {str(e)}"})
        }
