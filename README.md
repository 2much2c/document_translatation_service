# 📄 문서 번역요약 서비스

Vercel과 파이썬을 활용한 문서 번역 및 요약 서비스입니다.

## 🚀 기능

- **파일 업로드**: PDF, Word, 이미지, 텍스트 파일 지원
- **텍스트 추출**: OCR을 통한 이미지 텍스트 추출
- **번역**: 다국어 번역 지원 (한국어, 영어, 일본어, 중국어 등)
- **요약**: LSA 및 TextRank 알고리즘을 활용한 텍스트 요약
- **결과 다운로드**: 번역/요약 결과를 파일로 저장

## 🛠️ 기술 스택

- **Backend**: Python (FastAPI, Vercel Serverless Functions)
- **Frontend**: HTML, CSS, JavaScript
- **번역**: Google Translate API
- **요약**: Sumy 라이브러리
- **OCR**: Tesseract
- **배포**: Vercel

## 📁 프로젝트 구조

```
document-translation-service/
├── api/                    # Vercel Serverless Functions
│   ├── translate.py        # 번역 API
│   ├── summarize.py        # 요약 API
│   └── upload.py           # 파일 업로드 API
├── public/                 # 정적 파일
│   ├── index.html          # 메인 페이지
│   ├── style.css           # 스타일시트
│   └── script.js           # JavaScript
├── requirements.txt        # Python 의존성
├── vercel.json            # Vercel 설정
├── env.example            # 환경 변수 예시
└── README.md              # 프로젝트 설명
```

## 🚀 배포 방법

### 1. Vercel CLI 설치
```bash
npm install -g vercel
```

### 2. 프로젝트 초기화
```bash
cd document-translation-service
vercel login
vercel init
```

### 3. 환경 변수 설정
Vercel 대시보드에서 다음 환경 변수를 설정하세요:
- `OPENAI_API_KEY` (선택사항)
- `GOOGLE_TRANSLATE_API_KEY` (선택사항)

### 4. 배포
```bash
vercel --prod
```

## 🔧 로컬 개발

### 1. 의존성 설치
```bash
pip install -r requirements.txt
```

### 2. 환경 변수 설정
```bash
cp env.example .env
# .env 파일을 편집하여 필요한 값들을 설정
```

### 3. 로컬 서버 실행
```bash
vercel dev
```

## 📝 API 엔드포인트

### POST /api/upload
파일 업로드 및 텍스트 추출
```json
{
  "file_data": "base64_encoded_file",
  "file_type": "application/pdf",
  "file_name": "document.pdf"
}
```

### POST /api/translate
텍스트 번역
```json
{
  "text": "번역할 텍스트",
  "source_lang": "ko",
  "target_lang": "en"
}
```

### POST /api/summarize
텍스트 요약
```json
{
  "text": "요약할 텍스트",
  "method": "lsa",
  "sentences_count": 3
}
```

## 🌐 지원 언어

- 한국어 (ko)
- 영어 (en)
- 일본어 (ja)
- 중국어 (zh)
- 스페인어 (es)
- 프랑스어 (fr)
- 독일어 (de)
- 러시아어 (ru)

## 📄 지원 파일 형식

- **PDF**: .pdf
- **Word**: .doc, .docx
- **이미지**: .png, .jpg, .jpeg, .gif, .bmp
- **텍스트**: .txt

## ⚠️ 주의사항

- 파일 크기 제한: 10MB
- Vercel의 Serverless Functions 제한 시간: 30초
- 무료 Google Translate API는 일일 사용량 제한이 있습니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.
