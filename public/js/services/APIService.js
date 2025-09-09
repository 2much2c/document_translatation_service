/**
 * APIService - API 통신 서비스
 * MVC 패턴의 Service 역할
 */
class APIService {
  constructor() {
    this.baseURL = '/api';
    this.timeout = 30000; // 30초
  }

  /**
   * HTTP 요청 공통 메서드
   * @param {string} endpoint - API 엔드포인트
   * @param {Object} options - 요청 옵션
   * @returns {Promise<Object>} 응답 데이터
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: this.timeout,
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API 요청 실패');
      }

      return data;
    } catch (error) {
      console.error('API 요청 실패:', error);
      throw new Error(`API 요청 실패: ${error.message}`);
    }
  }

  /**
   * 텍스트 번역
   * @param {string} text - 번역할 텍스트
   * @param {string} targetLang - 대상 언어
   * @returns {Promise<string>} 번역된 텍스트
   */
  async translateText(text, targetLang = 'ko') {
    try {
      const data = await this.request('/translate', {
        body: JSON.stringify({
          text: text,
          source_lang: 'en',
          target_lang: targetLang
        })
      });

      return data.translated_text;
    } catch (error) {
      throw new Error(`번역 실패: ${error.message}`);
    }
  }

  /**
   * 텍스트 요약
   * @param {string} text - 요약할 텍스트
   * @param {string} method - 요약 방법
   * @param {number} sentencesCount - 문장 수
   * @returns {Promise<string>} 요약된 텍스트
   */
  async summarizeText(text, method = 'detailed', sentencesCount = 3) {
    try {
      const data = await this.request('/summarize', {
        body: JSON.stringify({
          text: text,
          method: method,
          sentences_count: sentencesCount
        })
      });

      return data.summary;
    } catch (error) {
      throw new Error(`요약 실패: ${error.message}`);
    }
  }

  /**
   * 파일 업로드 및 텍스트 추출
   * @param {File} file - 업로드할 파일
   * @returns {Promise<string>} 추출된 텍스트
   */
  async uploadFile(file) {
    try {
      // 파일을 base64로 변환
      const base64 = await this.fileToBase64(file);
      
      const data = await this.request('/upload', {
        body: JSON.stringify({
          file_data: base64,
          file_type: file.type,
          file_name: file.name
        })
      });

      return data.extracted_text;
    } catch (error) {
      throw new Error(`파일 업로드 실패: ${error.message}`);
    }
  }

  /**
   * 파일을 base64로 변환
   * @param {File} file - 변환할 파일
   * @returns {Promise<string>} base64 문자열
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('파일 읽기 실패'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * 번역과 요약을 동시에 실행
   * @param {string} text - 처리할 텍스트
   * @param {string} targetLang - 대상 언어
   * @param {string} method - 요약 방법
   * @param {number} sentencesCount - 문장 수
   * @returns {Promise<Object>} 번역과 요약 결과
   */
  async processDocument(text, targetLang = 'ko', method = 'detailed', sentencesCount = 3) {
    try {
      const [translation, summary] = await Promise.all([
        this.translateText(text, targetLang),
        this.summarizeText(text, method, sentencesCount)
      ]);

      return {
        translation,
        summary,
        original: text
      };
    } catch (error) {
      throw new Error(`문서 처리 실패: ${error.message}`);
    }
  }

  /**
   * 지원하는 언어 목록 조회
   * @returns {Promise<Object>} 지원하는 언어 목록
   */
  async getSupportedLanguages() {
    try {
      const response = await fetch(`${this.baseURL}/translate`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return data.supported_languages || {};
    } catch (error) {
      console.warn('언어 목록 조회 실패:', error);
      return {};
    }
  }

  /**
   * 지원하는 요약 방법 조회
   * @returns {Promise<Object>} 지원하는 요약 방법
   */
  async getSummaryMethods() {
    try {
      const response = await fetch(`${this.baseURL}/summarize`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return data.methods || {};
    } catch (error) {
      console.warn('요약 방법 조회 실패:', error);
      return {};
    }
  }
}
