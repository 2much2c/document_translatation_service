/**
 * SettingsModel - 설정 모델
 * MVC 패턴의 Model 역할
 */
class SettingsModel {
  constructor() {
    this.summaryMethod = 'detailed';
    this.sentenceCount = 3;
    this.autoProcess = true;
    this.showAdvanced = false;
    
    // 설정 로드
    this.loadFromStorage();
  }

  /**
   * 요약 방법 반환
   * @returns {string} 요약 방법
   */
  getSummaryMethod() {
    return this.summaryMethod;
  }

  /**
   * 요약 방법 설정
   * @param {string} method - 요약 방법
   */
  setSummaryMethod(method) {
    if (['detailed', 'brief'].includes(method)) {
      this.summaryMethod = method;
      this.saveToStorage();
    }
  }

  /**
   * 문장 수 반환
   * @returns {number} 문장 수
   */
  getSentenceCount() {
    return this.sentenceCount;
  }

  /**
   * 문장 수 설정
   * @param {number} count - 문장 수
   */
  setSentenceCount(count) {
    if (count >= 1 && count <= 10) {
      this.sentenceCount = count;
      this.saveToStorage();
    }
  }

  /**
   * 자동 처리 여부 반환
   * @returns {boolean} 자동 처리 여부
   */
  getAutoProcess() {
    return this.autoProcess;
  }

  /**
   * 자동 처리 설정
   * @param {boolean} auto - 자동 처리 여부
   */
  setAutoProcess(auto) {
    this.autoProcess = auto;
    this.saveToStorage();
  }

  /**
   * 고급 설정 표시 여부 반환
   * @returns {boolean} 고급 설정 표시 여부
   */
  getShowAdvanced() {
    return this.showAdvanced;
  }

  /**
   * 고급 설정 표시 설정
   * @param {boolean} show - 고급 설정 표시 여부
   */
  setShowAdvanced(show) {
    this.showAdvanced = show;
  }

  /**
   * 요약 방법 옵션 반환
   * @returns {Array} 요약 방법 옵션
   */
  getSummaryMethodOptions() {
    return [
      { value: 'detailed', label: '상세 요약', description: '맥락과 세부사항 포함' },
      { value: 'brief', label: '간단 요약', description: '핵심 내용만' }
    ];
  }

  /**
   * 문장 수 옵션 반환
   * @returns {Array} 문장 수 옵션
   */
  getSentenceCountOptions() {
    return Array.from({ length: 10 }, (_, i) => ({
      value: i + 1,
      label: `${i + 1}문장`
    }));
  }

  /**
   * 설정을 로컬 스토리지에 저장
   */
  saveToStorage() {
    const settings = {
      summaryMethod: this.summaryMethod,
      sentenceCount: this.sentenceCount,
      autoProcess: this.autoProcess
    };
    
    localStorage.setItem('settings', JSON.stringify(settings));
  }

  /**
   * 로컬 스토리지에서 설정 불러오기
   */
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('settings');
      if (saved) {
        const settings = JSON.parse(saved);
        this.summaryMethod = settings.summaryMethod || 'detailed';
        this.sentenceCount = settings.sentenceCount || 3;
        this.autoProcess = settings.autoProcess !== false;
      }
    } catch (error) {
      console.warn('설정 불러오기 실패:', error);
      // 기본값 사용
    }
  }

  /**
   * 설정 초기화
   */
  reset() {
    this.summaryMethod = 'detailed';
    this.sentenceCount = 3;
    this.autoProcess = true;
    this.showAdvanced = false;
    this.saveToStorage();
  }

  /**
   * 현재 설정 반환
   * @returns {Object} 현재 설정
   */
  getCurrentSettings() {
    return {
      summaryMethod: this.summaryMethod,
      sentenceCount: this.sentenceCount,
      autoProcess: this.autoProcess,
      showAdvanced: this.showAdvanced
    };
  }
}
