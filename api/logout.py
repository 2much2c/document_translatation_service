"""
로그아웃 API
"""
import json

def handler(request):
    """로그아웃"""
    return {
        "statusCode": 200,
        "body": json.dumps({"message": "로그아웃되었습니다"})
    }
