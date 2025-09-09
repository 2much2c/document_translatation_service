/**
 * LanguageModel - 언어 설정 모델
 * MVC 패턴의 Model 역할
 */
class LanguageModel {
  constructor() {
    this.supportedLanguages = {
      'ko': { name: '한국어', flag: '🇰🇷', code: 'ko' },
      'en': { name: '영어', flag: '🇺🇸', code: 'en' },
      'ja': { name: '일본어', flag: '🇯🇵', code: 'ja' },
      'zh': { name: '중국어', flag: '🇨🇳', code: 'zh' },
      'es': { name: '스페인어', flag: '🇪🇸', code: 'es' },
      'fr': { name: '프랑스어', flag: '🇫🇷', code: 'fr' },
      'de': { name: '독일어', flag: '🇩🇪', code: 'de' },
      'ru': { name: '러시아어', flag: '🇷🇺', code: 'ru' }
    };
    
    this.selectedLanguage = 'ko';
    this.sourceLanguage = 'en'; // 고정: 영어
  }

  /**
   * 지원하는 언어 목록 반환
   * @returns {Object} 지원하는 언어 목록
   */
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  /**
   * 선택된 언어 반환
   * @returns {string} 선택된 언어 코드
   */
  getSelectedLanguage() {
    return this.selectedLanguage;
  }

  /**
   * 선택된 언어 설정
   * @param {string} lang - 언어 코드
   */
  setSelectedLanguage(lang) {
    if (this.supportedLanguages[lang]) {
      this.selectedLanguage = lang;
      this.saveToStorage();
    }
  }

  /**
   * 원본 언어 반환 (고정: 영어)
   * @returns {string} 원본 언어 코드
   */
  getSourceLanguage() {
    return this.sourceLanguage;
  }

  /**
   * 언어 정보 반환
   * @param {string} lang - 언어 코드
   * @returns {Object|null} 언어 정보
   */
  getLanguageInfo(lang) {
    return this.supportedLanguages[lang] || null;
  }

  /**
   * 선택된 언어의 표시 텍스트 반환
   * @returns {string} 표시 텍스트
   */
  getSelectedLanguageDisplay() {
    const sourceInfo = this.getLanguageInfo(this.sourceLanguage);
    const targetInfo = this.getLanguageInfo(this.selectedLanguage);
    
    if (sourceInfo && targetInfo) {
      return `${sourceInfo.name} → ${targetInfo.name}`;
    }
    
    return '영어 → 한국어';
  }

  /**
   * 언어 설정을 로컬 스토리지에 저장
   */
  saveToStorage() {
    localStorage.setItem('selectedLanguage', this.selectedLanguage);
  }

  /**
   * 로컬 스토리지에서 언어 설정 불러오기
   */
  loadFromStorage() {
    const saved = localStorage.getItem('selectedLanguage');
    if (saved && this.supportedLanguages[saved]) {
      this.selectedLanguage = saved;
    }
  }

  /**
   * 언어 코드 유효성 검사
   * @param {string} lang - 언어 코드
   * @returns {boolean} 유효성 여부
   */
  isValidLanguage(lang) {
    return this.supportedLanguages.hasOwnProperty(lang);
  }

  /**
   * 언어 목록을 배열로 반환
   * @returns {Array} 언어 목록 배열
   */
  getLanguageList() {
    return Object.entries(this.supportedLanguages).map(([code, info]) => ({
      code,
      ...info
    }));
  }
}
