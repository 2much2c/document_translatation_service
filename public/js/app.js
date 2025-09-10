/**
 * App - 메인 애플리케이션 클래스
 * MVC 패턴의 통합 관리
 */
class App {
  constructor() {
    this.models = {};
    this.views = {};
    this.controllers = {};
    this.services = {};
    
    this.isInitialized = false;
    this.isProcessing = false;
    
    this.init();
  }

  /**
   * 애플리케이션 초기화
   */
  init() {
    try {
      this.initializeServices();
      this.initializeModels();
      this.initializeViews();
      this.initializeControllers();
      this.bindGlobalEvents();
      this.start();
      
      this.isInitialized = true;
      console.log('App initialized successfully');
      
    } catch (error) {
      console.error('App initialization failed:', error);
      this.handleError(error);
    }
  }

  /**
   * 서비스 초기화
   */
  initializeServices() {
    this.services = {
      eventBus: window.eventBus,  // 전역 EventBus 사용
      api: new APIService(),
      file: new FileService(),
      storage: new StorageService()
    };
  }

  /**
   * 모델 초기화
   */
  initializeModels() {
    this.models = {
      document: new DocumentModel(),
      language: new LanguageModel(),
      settings: new SettingsModel()
    };
  }

  /**
   * 뷰 초기화
   */
  initializeViews() {
    this.views = {
      upload: new UploadView(),
      language: new LanguageView(),
      result: new ResultView(),
      modal: new ModalView()
    };
  }

  /**
   * 컨트롤러 초기화
   */
  initializeControllers() {
    this.controllers = {
      document: new DocumentController(
        this.models.document,
        this.views.upload,
        this.views.result
      ),
      language: new LanguageController(
        this.models.language,
        this.views.language
      ),
      ui: new UIController()
    };
  }

  /**
   * 전역 이벤트 바인딩
   */
  bindGlobalEvents() {
    // EventBus를 통한 이벤트 구독
    this.eventBus = this.services.eventBus;
    
    this.eventBus.on('app.stateChanged', (data) => {
      this.handleAppStateChange(data);
    });

    this.eventBus.on('app.error', (data) => {
      this.handleError(data.error);
    });

    this.eventBus.on('app.success', (data) => {
      this.handleSuccess(data.message);
    });

    // 모바일 메뉴 토글
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuToggle && mobileMenu) {
      mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
      });
    }

    // 히어로 섹션 버튼들
    const startBtn = document.getElementById('startBtn');
    const learnMoreBtn = document.getElementById('learnMoreBtn');
    
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        // 문서 업로드 섹션으로 스크롤
        const uploadSection = document.querySelector('.upload-section');
        if (uploadSection) {
          uploadSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
    
    if (learnMoreBtn) {
      learnMoreBtn.addEventListener('click', () => {
        // 도움말 모달 열기
        this.controllers.ui.showHelp();
      });
    }

    // 네비게이션 링크 활성화
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // 모든 링크에서 active 클래스 제거
        navLinks.forEach(l => l.classList.remove('active'));
        // 클릭된 링크에 active 클래스 추가
        e.target.classList.add('active');
        
        // 모바일 메뉴 닫기
        if (mobileMenu && mobileMenu.classList.contains('active')) {
          mobileMenuToggle.classList.remove('active');
          mobileMenu.classList.remove('active');
        }
      });
    });
  }

  /**
   * 애플리케이션 시작
   */
  start() {
    // 뷰 렌더링
    this.renderViews();
    
    // 설정 로드
    this.loadSettings();
    
    // 초기 상태 설정
    this.setInitialState();
    
    // 앱 시작 이벤트 트리거
    this.triggerEvent('appStarted', { timestamp: Date.now() });
  }

  /**
   * 뷰 렌더링
   */
  renderViews() {
    this.views.upload.render();
    this.views.language.render(this.models.language);
    this.views.result.render();
  }

  /**
   * 설정 로드
   */
  loadSettings() {
    try {
      // 언어 설정 로드
      this.models.language.loadFromStorage();
      
      // 앱 설정 로드
      this.models.settings.loadFromStorage();
      
      // UI 상태 로드
      this.controllers.ui.loadUIState();
      
    } catch (error) {
      console.warn('설정 로드 중 오류:', error);
    }
  }

  /**
   * 초기 상태 설정
   */
  setInitialState() {
    // 초기 UI 상태 설정
    this.updateUIState();
    
    // 초기 언어 설정
    this.updateLanguageDisplay();
  }

  /**
   * UI 상태 업데이트
   */
  updateUIState() {
    const state = this.getAppState();
    
    // 상태에 따른 UI 업데이트
    if (state.isProcessing) {
      this.views.upload.showProcessing();
    } else {
      this.views.upload.hideProcessing();
    }
    
    if (state.hasResults) {
      this.views.result.show();
    } else {
      this.views.result.hide();
    }
  }

  /**
   * 언어 표시 업데이트
   */
  updateLanguageDisplay() {
    const currentLanguage = this.models.language.getSelectedLanguage();
    this.views.language.updateSelectedLanguage(currentLanguage);
  }

  /**
   * 앱 상태 변경 처리
   * @param {Object} state - 새로운 상태
   */
  handleAppStateChange(state) {
    this.updateUIState();
    
    // 상태 변경 이벤트 트리거
    this.triggerEvent('stateUpdated', { state });
  }

  /**
   * 에러 처리
   * @param {Error} error - 에러 객체
   */
  handleError(error) {
    console.error('App Error:', error);
    
    // 에러 모달 표시
    this.controllers.ui.showNotification(
      error.message || '알 수 없는 오류가 발생했습니다.',
      'error'
    );
    
    // 에러 이벤트 트리거
    this.triggerEvent('appError', { error });
  }

  /**
   * 성공 처리
   * @param {string} message - 성공 메시지
   */
  handleSuccess(message) {
    this.controllers.ui.showNotification(message, 'success');
    
    // 성공 이벤트 트리거
    this.triggerEvent('appSuccess', { message });
  }

  /**
   * 이벤트 트리거
   * @param {string} eventName - 이벤트 이름
   * @param {Object} detail - 이벤트 상세 정보
   */
  triggerEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  /**
   * 앱 상태 반환
   * @returns {Object} 앱 상태
   */
  getAppState() {
    return {
      isInitialized: this.isInitialized,
      isProcessing: this.controllers.document.getDocumentState().isProcessing,
      hasFile: this.controllers.document.getDocumentState().hasFile,
      hasResults: this.controllers.document.getDocumentState().hasTranslation,
      currentLanguage: this.models.language.getSelectedLanguage(),
      currentSettings: this.models.settings.getCurrentSettings()
    };
  }

  /**
   * 앱 통계 반환
   * @returns {Object} 앱 통계
   */
  getAppStats() {
    return {
      documentStats: this.controllers.document.getProcessingStats(),
      languageState: this.controllers.language.getState(),
      uiState: this.controllers.ui.getState(),
      storageUsage: this.services.storage.getStorageUsage()
    };
  }

  /**
   * 앱 설정 내보내기
   * @returns {Object} 앱 설정
   */
  exportSettings() {
    return {
      language: this.models.language.getSelectedLanguage(),
      settings: this.models.settings.getCurrentSettings(),
      timestamp: Date.now(),
      version: '1.0.0'
    };
  }

  /**
   * 앱 설정 가져오기
   * @param {Object} settings - 가져올 설정
   */
  importSettings(settings) {
    try {
      if (settings.language) {
        this.controllers.language.handleLanguageChange(settings.language);
      }
      
      if (settings.settings) {
        this.controllers.language.handleSettingsChange(settings.settings);
      }
      
      this.handleSuccess('설정이 성공적으로 가져와졌습니다.');
      
    } catch (error) {
      this.handleError(new Error('설정 가져오기 실패: ' + error.message));
    }
  }

  /**
   * 앱 초기화
   */
  reset() {
    try {
      // 모든 컨트롤러 초기화
      Object.values(this.controllers).forEach(controller => {
        if (controller.reset) {
          controller.reset();
        }
      });
      
      // 모든 모델 초기화
      Object.values(this.models).forEach(model => {
        if (model.reset) {
          model.reset();
        }
      });
      
      // UI 상태 초기화
      this.controllers.ui.reset();
      
      this.handleSuccess('앱이 초기화되었습니다.');
      
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 앱 종료
   */
  destroy() {
    try {
      // 상태 저장
      this.controllers.ui.saveUIState();
      
      // 이벤트 리스너 제거
      document.removeEventListener('appStateChanged', this.handleAppStateChange);
      document.removeEventListener('appError', this.handleError);
      document.removeEventListener('appSuccess', this.handleSuccess);
      
      // 앱 종료 이벤트 트리거
      this.triggerEvent('appDestroyed', { timestamp: Date.now() });
      
      console.log('App destroyed successfully');
      
    } catch (error) {
      console.error('App destruction failed:', error);
    }
  }

  /**
   * 디버그 정보 반환
   * @returns {Object} 디버그 정보
   */
  getDebugInfo() {
    return {
      appState: this.getAppState(),
      appStats: this.getAppStats(),
      models: Object.keys(this.models),
      views: Object.keys(this.views),
      controllers: Object.keys(this.controllers),
      services: Object.keys(this.services)
    };
  }
}

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

// 앱 종료 시 정리
window.addEventListener('beforeunload', () => {
  if (window.app) {
    window.app.destroy();
  }
});
