/**
 * StorageService - 로컬 스토리지 서비스
 * MVC 패턴의 Service 역할
 */
class StorageService {
  constructor() {
    this.prefix = 'dts_'; // Document Translation Service
  }

  /**
   * 키 생성
   * @param {string} key - 원본 키
   * @returns {string} 프리픽스가 추가된 키
   */
  getKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * 데이터 저장
   * @param {string} key - 키
   * @param {any} value - 값
   * @returns {boolean} 저장 성공 여부
   */
  set(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this.getKey(key), serializedValue);
      return true;
    } catch (error) {
      console.error('데이터 저장 실패:', error);
      return false;
    }
  }

  /**
   * 데이터 조회
   * @param {string} key - 키
   * @param {any} defaultValue - 기본값
   * @returns {any} 저장된 값 또는 기본값
   */
  get(key, defaultValue = null) {
    try {
      const serializedValue = localStorage.getItem(this.getKey(key));
      if (serializedValue === null) {
        return defaultValue;
      }
      return JSON.parse(serializedValue);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      return defaultValue;
    }
  }

  /**
   * 데이터 삭제
   * @param {string} key - 키
   * @returns {boolean} 삭제 성공 여부
   */
  remove(key) {
    try {
      localStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error('데이터 삭제 실패:', error);
      return false;
    }
  }

  /**
   * 모든 데이터 삭제
   * @returns {boolean} 삭제 성공 여부
   */
  clear() {
    try {
      const keys = Object.keys(localStorage);
      const appKeys = keys.filter(key => key.startsWith(this.prefix));
      
      appKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      return true;
    } catch (error) {
      console.error('모든 데이터 삭제 실패:', error);
      return false;
    }
  }

  /**
   * 키 존재 여부 확인
   * @param {string} key - 키
   * @returns {boolean} 존재 여부
   */
  has(key) {
    return localStorage.getItem(this.getKey(key)) !== null;
  }

  /**
   * 사용자 설정 저장
   * @param {Object} settings - 설정 객체
   * @returns {boolean} 저장 성공 여부
   */
  saveSettings(settings) {
    return this.set('settings', settings);
  }

  /**
   * 사용자 설정 조회
   * @returns {Object} 설정 객체
   */
  getSettings() {
    return this.get('settings', {
      language: 'ko',
      summaryMethod: 'detailed',
      sentenceCount: 3,
      autoProcess: true
    });
  }

  /**
   * 언어 설정 저장
   * @param {string} language - 언어 코드
   * @returns {boolean} 저장 성공 여부
   */
  saveLanguage(language) {
    return this.set('language', language);
  }

  /**
   * 언어 설정 조회
   * @returns {string} 언어 코드
   */
  getLanguage() {
    return this.get('language', 'ko');
  }

  /**
   * 처리 히스토리 저장
   * @param {Object} history - 히스토리 객체
   * @returns {boolean} 저장 성공 여부
   */
  saveHistory(history) {
    const histories = this.getHistory();
    histories.unshift({
      ...history,
      timestamp: Date.now()
    });
    
    // 최대 50개까지만 저장
    if (histories.length > 50) {
      histories.splice(50);
    }
    
    return this.set('history', histories);
  }

  /**
   * 처리 히스토리 조회
   * @returns {Array} 히스토리 배열
   */
  getHistory() {
    return this.get('history', []);
  }

  /**
   * 히스토리 삭제
   * @param {number} index - 삭제할 인덱스
   * @returns {boolean} 삭제 성공 여부
   */
  removeHistory(index) {
    const histories = this.getHistory();
    if (index >= 0 && index < histories.length) {
      histories.splice(index, 1);
      return this.set('history', histories);
    }
    return false;
  }

  /**
   * 히스토리 전체 삭제
   * @returns {boolean} 삭제 성공 여부
   */
  clearHistory() {
    return this.set('history', []);
  }

  /**
   * 앱 상태 저장
   * @param {Object} state - 앱 상태
   * @returns {boolean} 저장 성공 여부
   */
  saveAppState(state) {
    return this.set('appState', state);
  }

  /**
   * 앱 상태 조회
   * @returns {Object} 앱 상태
   */
  getAppState() {
    return this.get('appState', {
      currentFile: null,
      extractedText: '',
      translation: '',
      summary: '',
      processing: false
    });
  }

  /**
   * 스토리지 사용량 조회
   * @returns {Object} 사용량 정보
   */
  getStorageUsage() {
    let totalSize = 0;
    const keys = Object.keys(localStorage);
    const appKeys = keys.filter(key => key.startsWith(this.prefix));
    
    appKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += key.length + value.length;
      }
    });
    
    return {
      totalSize,
      keyCount: appKeys.length,
      formattedSize: this.formatBytes(totalSize)
    };
  }

  /**
   * 바이트를 포맷된 문자열로 변환
   * @param {number} bytes - 바이트 수
   * @returns {string} 포맷된 문자열
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
