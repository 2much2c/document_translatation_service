from openai import OpenAI
from typing import Optional
from config.settings import Settings
from models.translation import TranslationRequest, TranslationResult, Language
from models.summary import SummaryRequest, SummaryResult, SummaryMethod

class OpenAIService:
    """OpenAI API 서비스 클래스"""
    
    def __init__(self):
        """OpenAI 클라이언트 초기화"""
        Settings.validate()
        self.client = OpenAI(api_key=Settings.OPENAI_API_KEY)
        self.config = Settings.get_openai_config()
    
    def translate_text(self, request: TranslationRequest) -> TranslationResult:
        """텍스트 번역"""
        try:
            # 언어 코드를 언어명으로 변환
            lang_names = Settings.SUPPORTED_LANGUAGES
            target_lang_name = lang_names.get(request.target_language.value, request.target_language.value)
            source_lang_name = lang_names.get(request.source_language.value, request.source_language.value) if request.source_language != Language.AUTO else '자동 감지'
            
            # 번역 프롬프트 생성
            prompt = f"다음 텍스트를 {target_lang_name}로 번역해주세요. 원문의 의미와 뉘앙스를 정확히 전달하되 자연스러운 {target_lang_name}로 번역해주세요:\n\n{request.text}"
            
            # OpenAI API 호출
            response = self.client.chat.completions.create(
                model=self.config["model"],
                messages=[
                    {"role": "system", "content": f"당신은 전문 번역가입니다. 주어진 텍스트를 정확하고 자연스럽게 {target_lang_name}로 번역합니다."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.config["max_tokens"],
                temperature=self.config["temperature"]
            )
            
            translated_text = response.choices[0].message.content.strip()
            
            return TranslationResult(
                original_text=request.text,
                translated_text=translated_text,
                source_language=request.source_language,
                target_language=request.target_language,
                model=self.config["model"]
            )
            
        except Exception as e:
            raise Exception(f"번역 중 오류가 발생했습니다: {str(e)}")
    
    def summarize_text(self, request: SummaryRequest) -> SummaryResult:
        """텍스트 요약"""
        try:
            # 요약 방법에 따른 프롬프트 설정
            if request.method == SummaryMethod.GPT_BRIEF:
                prompt = f"다음 텍스트를 {request.sentences_count}문장으로 간단히 요약해주세요. 핵심 내용만 포함하여 요약해주세요:\n\n{request.text}"
            else:  # GPT_DETAILED
                prompt = f"다음 텍스트를 {request.sentences_count}문장으로 상세하고 정확하게 요약해주세요. 중요한 정보와 맥락을 모두 포함하여 요약해주세요:\n\n{request.text}"
            
            # OpenAI API 호출
            response = self.client.chat.completions.create(
                model=self.config["model"],
                messages=[
                    {"role": "system", "content": "당신은 전문 요약가입니다. 주어진 텍스트를 요청된 문장 수로 정확하고 명확하게 요약합니다."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=self.config["temperature"]
            )
            
            summary_text = response.choices[0].message.content.strip()
            
            return SummaryResult(
                original_text=request.text,
                summary=summary_text,
                method=request.method,
                sentences_count=request.sentences_count,
                original_length=len(request.text.split()),
                summary_length=len(summary_text.split()),
                model=self.config["model"]
            )
            
        except Exception as e:
            raise Exception(f"요약 중 오류가 발생했습니다: {str(e)}")
    
    def get_supported_languages(self) -> dict:
        """지원하는 언어 목록 반환"""
        return Settings.SUPPORTED_LANGUAGES
    
    def get_summary_methods(self) -> dict:
        """지원하는 요약 방법 반환"""
        return {
            "gpt": "GPT 기반 상세 요약 - 맥락과 세부사항 포함",
            "brief": "GPT 기반 간단 요약 - 핵심 내용만"
        }
