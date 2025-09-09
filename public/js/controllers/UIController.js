/**
 * UIController - UI 컨트롤러
 * MVC 패턴의 Controller 역할
 */
class UIController {
  constructor() {
    this.modalView = new ModalView();
    this.storageService = new StorageService();
    this.isInitialized = false;
    
    this.init();
  }

  /**
   * 컨트롤러 초기화
   */
  init() {
    this.bindEvents();
    this.loadUIState();
    this.isInitialized = true;
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 키보드 단축키
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });

    // 윈도우 이벤트
    window.addEventListener('beforeunload', () => {
      this.saveUIState();
    });

    // 리사이즈 이벤트
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // 스크롤 이벤트
    window.addEventListener('scroll', () => {
      this.handleScroll();
    });
  }

  /**
   * 키보드 단축키 처리
   * @param {KeyboardEvent} e - 키보드 이벤트
   */
  handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + 키 조합
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'o':
          e.preventDefault();
          this.openFileDialog();
          break;
        case 's':
          e.preventDefault();
          this.saveResults();
          break;
        case 'r':
          e.preventDefault();
          this.retry();
          break;
        case 'h':
          e.preventDefault();
          this.showHelp();
          break;
      }
    }

    // ESC 키
    if (e.key === 'Escape') {
      this.handleEscape();
    }
  }

  /**
   * 윈도우 리사이즈 처리
   */
  handleResize() {
    // 모바일/데스크톱 전환 감지
    const isMobile = window.innerWidth <= 768;
    document.body.classList.toggle('mobile', isMobile);
    
    // 모달 위치 조정
    this.adjustModalPosition();
  }

  /**
   * 스크롤 처리
   */
  handleScroll() {
    // 스크롤 위치에 따른 UI 업데이트
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // 헤더 고정
    const header = document.querySelector('.header');
    if (header) {
      header.classList.toggle('fixed', scrollTop > 100);
    }
    
    // 스크롤 투 탑 버튼
    const scrollToTopBtn = document.querySelector('.scroll-to-top');
    if (scrollToTopBtn) {
      scrollToTopBtn.classList.toggle('show', scrollTop > 300);
    }
  }

  /**
   * ESC 키 처리
   */
  handleEscape() {
    // 활성 모달이 있으면 닫기
    const activeModal = this.modalView.getActiveModal();
    if (activeModal) {
      this.modalView.hide(activeModal);
      return;
    }

    // 결과 섹션이 열려있으면 닫기
    const resultSection = document.getElementById('resultSection');
    if (resultSection && resultSection.style.display !== 'none') {
      this.hideResults();
    }
  }

  /**
   * 파일 다이얼로그 열기
   */
  openFileDialog() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.click();
    }
  }

  /**
   * 결과 저장
   */
  saveResults() {
    const resultView = document.querySelector('.result-section');
    if (resultView && resultView.style.display !== 'none') {
      // 다운로드 버튼 클릭
      const downloadBtn = resultView.querySelector('.download-btn');
      if (downloadBtn) {
        downloadBtn.click();
      }
    }
  }

  /**
   * 다시하기
   */
  retry() {
    const event = new CustomEvent('retryRequested');
    document.dispatchEvent(event);
  }

  /**
   * 도움말 표시
   */
  showHelp() {
    const helpContent = `
      <div class="help-content">
        <h3>키보드 단축키</h3>
        <ul>
          <li><kbd>Ctrl/Cmd + O</kbd> - 파일 열기</li>
          <li><kbd>Ctrl/Cmd + S</kbd> - 결과 저장</li>
          <li><kbd>Ctrl/Cmd + R</kbd> - 다시하기</li>
          <li><kbd>Ctrl/Cmd + H</kbd> - 도움말</li>
          <li><kbd>ESC</kbd> - 닫기</li>
        </ul>
        
        <h3>사용법</h3>
        <ol>
          <li>파일을 드래그하거나 클릭하여 업로드</li>
          <li>언어를 선택 (기본: 한국어)</li>
          <li>AI가 자동으로 번역과 요약을 처리</li>
          <li>결과를 복사하거나 다운로드</li>
        </ol>
      </div>
    `;

    const modal = this.modalView.create('helpModal', {
      title: '도움말',
      content: helpContent,
      size: 'large'
    });

    this.modalView.show(modal);
  }

  /**
   * 모달 위치 조정
   */
  adjustModalPosition() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      if (modal.style.display !== 'none') {
        const content = modal.querySelector('.modal-content');
        if (content) {
          content.style.marginTop = '5%';
        }
      }
    });
  }

  /**
   * 결과 섹션 숨김
   */
  hideResults() {
    const resultSection = document.getElementById('resultSection');
    if (resultSection) {
      resultSection.style.display = 'none';
    }
  }

  /**
   * 로딩 상태 표시
   * @param {string} message - 로딩 메시지
   */
  showLoading(message = '처리 중...') {
    const modal = this.modalView.createLoading(message);
    this.modalView.show(modal);
  }

  /**
   * 로딩 상태 숨김
   */
  hideLoading() {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) {
      this.modalView.hide(loadingModal);
    }
  }

  /**
   * 알림 표시
   * @param {string} message - 알림 메시지
   * @param {string} type - 알림 타입
   */
  showNotification(message, type = 'info') {
    const modal = this.modalView.createAlert(message, type);
    this.modalView.show(modal);
  }

  /**
   * 확인 대화상자 표시
   * @param {string} message - 확인 메시지
   * @param {Function} onConfirm - 확인 콜백
   * @param {Function} onCancel - 취소 콜백
   */
  showConfirm(message, onConfirm, onCancel) {
    const modal = this.modalView.createConfirm(message, onConfirm, onCancel);
    this.modalView.show(modal);
  }

  /**
   * UI 상태 저장
   */
  saveUIState() {
    const state = {
      language: this.storageService.getLanguage(),
      settings: this.storageService.getSettings(),
      timestamp: Date.now()
    };

    this.storageService.set('uiState', state);
  }

  /**
   * UI 상태 로드
   */
  loadUIState() {
    const state = this.storageService.get('uiState', {});
    
    if (state.language) {
      this.storageService.saveLanguage(state.language);
    }
    
    if (state.settings) {
      this.storageService.saveSettings(state.settings);
    }
  }

  /**
   * 테마 변경
   * @param {string} theme - 테마 (light, dark)
   */
  changeTheme(theme) {
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme}`);
    
    this.storageService.set('theme', theme);
    this.showNotification(`테마가 ${theme}로 변경되었습니다.`);
  }

  /**
   * 언어 변경
   * @param {string} language - 언어 코드
   */
  changeLanguage(language) {
    // 언어 변경 이벤트 트리거
    const event = new CustomEvent('languageChanged', { 
      detail: { language } 
    });
    document.dispatchEvent(event);
  }

  /**
   * 스크롤 투 탑
   */
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  /**
   * 컨트롤러 상태 반환
   * @returns {Object} 컨트롤러 상태
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      activeModal: !!this.modalView.getActiveModal(),
      theme: this.storageService.get('theme', 'light'),
      language: this.storageService.getLanguage()
    };
  }

  /**
   * 컨트롤러 초기화
   */
  reset() {
    this.modalView.hideAll();
    this.hideLoading();
    this.hideResults();
  }
}
