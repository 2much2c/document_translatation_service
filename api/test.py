"""
테스트 API
"""
def handler(request):
    """테스트 API"""
    return {
        "statusCode": 200,
        "body": "테스트 API가 정상적으로 작동합니다!"
    }
