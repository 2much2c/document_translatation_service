/**
 * LanguageController - 언어 설정 컨트롤러
 * MVC 패턴의 Controller 역할
 */
class LanguageController {
  constructor(languageModel, languageView) {
    this.languageModel = languageModel;
    this.languageView = languageView;
    
    // 서비스 초기화
    this.storageService = new StorageService();
    
    this.init();
  }

  /**
   * 컨트롤러 초기화
   */
  init() {
    this.bindEvents();
    this.loadSettings();
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // EventBus를 통한 이벤트 구독
    this.eventBus = window.eventBus;
    
    this.eventBus.on('language.changed', (data) => {
      this.handleLanguageChange(data.language);
    });

    this.eventBus.on('settings.changed', (data) => {
      this.handleSettingsChange(data.settings);
    });
  }

  /**
   * 언어 변경 처리
   * @param {string} language - 새로운 언어 코드
   */
  handleLanguageChange(language) {
    try {
      // 언어 유효성 검사
      if (!this.languageModel.isValidLanguage(language)) {
        console.error('지원하지 않는 언어입니다:', language);
        return;
      }

      // 모델 업데이트
      this.languageModel.setSelectedLanguage(language);

      // 뷰 업데이트
      this.languageView.updateSelectedLanguage(language);
      this.languageView.updateSelection(language);

      // 설정 저장
      this.storageService.saveLanguage(language);

      // 언어 변경 알림
      this.showLanguageChangeNotification(language);

    } catch (error) {
      console.error('언어 변경 중 오류:', error);
      this.handleError(error);
    }
  }

  /**
   * 설정 변경 처리
   * @param {Object} settings - 새로운 설정
   */
  handleSettingsChange(settings) {
    try {
      // 설정 유효성 검사
      if (settings.language && !this.languageModel.isValidLanguage(settings.language)) {
        console.error('지원하지 않는 언어입니다:', settings.language);
        return;
      }

      // 언어 설정 업데이트
      if (settings.language) {
        this.languageModel.setSelectedLanguage(settings.language);
        this.languageView.updateSelectedLanguage(settings.language);
        this.languageView.updateSelection(settings.language);
      }

      // 설정 저장
      this.storageService.saveSettings(settings);

    } catch (error) {
      console.error('설정 변경 중 오류:', error);
      this.handleError(error);
    }
  }

  /**
   * 설정 로드
   */
  loadSettings() {
    try {
      // 저장된 언어 설정 로드
      const savedLanguage = this.storageService.getLanguage();
      if (savedLanguage && this.languageModel.isValidLanguage(savedLanguage)) {
        this.languageModel.setSelectedLanguage(savedLanguage);
        this.languageView.updateSelectedLanguage(savedLanguage);
        this.languageView.updateSelection(savedLanguage);
      }

      // 저장된 설정 로드
      const savedSettings = this.storageService.getSettings();
      if (savedSettings.language) {
        this.handleLanguageChange(savedSettings.language);
      }

    } catch (error) {
      console.error('설정 로드 중 오류:', error);
      // 기본값 사용
      this.languageModel.setSelectedLanguage('ko');
    }
  }

  /**
   * 언어 변경 알림 표시
   * @param {string} language - 언어 코드
   */
  showLanguageChangeNotification(language) {
    const languageInfo = this.languageModel.getLanguageInfo(language);
    if (languageInfo) {
      this.showToast(`언어가 ${languageInfo.name}로 변경되었습니다.`);
    }
  }

  /**
   * 지원하는 언어 목록 반환
   * @returns {Array} 지원하는 언어 목록
   */
  getSupportedLanguages() {
    return this.languageModel.getLanguageList();
  }

  /**
   * 현재 선택된 언어 반환
   * @returns {string} 현재 선택된 언어 코드
   */
  getCurrentLanguage() {
    return this.languageModel.getSelectedLanguage();
  }

  /**
   * 언어 정보 반환
   * @param {string} language - 언어 코드
   * @returns {Object|null} 언어 정보
   */
  getLanguageInfo(language) {
    return this.languageModel.getLanguageInfo(language);
  }

  /**
   * 언어 설정 검증
   * @param {string} language - 언어 코드
   * @returns {boolean} 유효성 여부
   */
  validateLanguage(language) {
    return this.languageModel.isValidLanguage(language);
  }

  /**
   * 언어 설정 초기화
   */
  reset() {
    this.languageModel.setSelectedLanguage('ko');
    this.languageView.updateSelectedLanguage('ko');
    this.languageView.updateSelection('ko');
    this.storageService.saveLanguage('ko');
  }

  /**
   * 언어 설정 내보내기
   * @returns {Object} 언어 설정
   */
  exportSettings() {
    return {
      selectedLanguage: this.languageModel.getSelectedLanguage(),
      supportedLanguages: this.languageModel.getSupportedLanguages(),
      timestamp: Date.now()
    };
  }

  /**
   * 언어 설정 가져오기
   * @param {Object} settings - 가져올 설정
   */
  importSettings(settings) {
    try {
      if (settings.selectedLanguage) {
        this.handleLanguageChange(settings.selectedLanguage);
      }
    } catch (error) {
      console.error('설정 가져오기 중 오류:', error);
      this.handleError(error);
    }
  }

  /**
   * 에러 처리
   * @param {Error} error - 에러 객체
   */
  handleError(error) {
    console.error('LanguageController 에러:', error);
    this.showToast('언어 설정 중 오류가 발생했습니다.', 'error');
  }

  /**
   * 토스트 메시지 표시
   * @param {string} message - 메시지
   * @param {string} type - 메시지 타입
   */
  showToast(message, type = 'success') {
    // 토스트 메시지 표시 로직
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: '10000',
      opacity: '0',
      transform: 'translateX(100%)',
      transition: 'all 0.3s ease',
      backgroundColor: type === 'error' ? '#ef4444' : '#10b981'
    });

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  /**
   * 컨트롤러 상태 반환
   * @returns {Object} 컨트롤러 상태
   */
  getState() {
    return {
      currentLanguage: this.languageModel.getSelectedLanguage(),
      supportedLanguages: this.languageModel.getSupportedLanguages(),
      isValid: this.languageModel.isValidLanguage(this.languageModel.getSelectedLanguage())
    };
  }
}
