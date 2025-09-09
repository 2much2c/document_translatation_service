/**
 * LanguageView - 언어 선택 뷰
 * MVC 패턴의 View 역할
 */
class LanguageView {
  constructor() {
    this.languageBtn = null;
    this.selectedLanguageSpan = null;
    this.modal = null;
    this.languageGrid = null;
    this.closeBtn = null;
    
    this.init();
  }

  /**
   * 뷰 초기화
   */
  init() {
    this.createElements();
    this.bindEvents();
  }

  /**
   * DOM 요소 생성
   */
  createElements() {
    // 언어 선택 버튼
    this.languageBtn = document.getElementById('languageBtn') || this.createLanguageButton();
    
    // 선택된 언어 표시
    this.selectedLanguageSpan = document.getElementById('selectedLanguage') || this.createSelectedLanguageSpan();
    
    // 언어 선택 모달
    this.modal = document.getElementById('languageModal') || this.createLanguageModal();
    
    // 언어 그리드
    this.languageGrid = this.modal.querySelector('.language-grid');
    
    // 닫기 버튼
    this.closeBtn = this.modal.querySelector('.close');
  }

  /**
   * 언어 선택 버튼 생성
   * @returns {HTMLElement} 언어 선택 버튼
   */
  createLanguageButton() {
    const button = document.createElement('button');
    button.id = 'languageBtn';
    button.className = 'language-btn';
    button.innerHTML = `
      <span id="selectedLanguage">영어 → 한국어</span>
      <span class="arrow">▼</span>
    `;
    return button;
  }

  /**
   * 선택된 언어 표시 요소 생성
   * @returns {HTMLElement} 선택된 언어 표시 요소
   */
  createSelectedLanguageSpan() {
    const span = document.createElement('span');
    span.id = 'selectedLanguage';
    span.textContent = '영어 → 한국어';
    return span;
  }

  /**
   * 언어 선택 모달 생성
   * @returns {HTMLElement} 언어 선택 모달
   */
  createLanguageModal() {
    const modal = document.createElement('div');
    modal.id = 'languageModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>언어 선택</h3>
          <span class="close">&times;</span>
        </div>
        <div class="modal-body">
          <div class="language-grid"></div>
        </div>
      </div>
    `;
    return modal;
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 언어 선택 버튼 클릭
    this.languageBtn.addEventListener('click', () => {
      this.showModal();
    });

    // 모달 닫기 버튼
    this.closeBtn.addEventListener('click', () => {
      this.hideModal();
    });

    // 모달 외부 클릭 시 닫기
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hideModal();
      }
    });

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.style.display === 'block') {
        this.hideModal();
      }
    });
  }

  /**
   * 모달 표시
   */
  showModal() {
    this.modal.style.display = 'block';
    this.renderLanguageGrid();
    document.body.style.overflow = 'hidden'; // 스크롤 방지
  }

  /**
   * 모달 숨김
   */
  hideModal() {
    this.modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // 스크롤 복원
  }

  /**
   * 언어 그리드 렌더링
   */
  renderLanguageGrid() {
    if (!this.languageGrid) return;

    this.languageGrid.innerHTML = '';

    // 언어 목록 생성
    const languages = [
      { code: 'ko', name: '한국어', flag: '🇰🇷' },
      { code: 'en', name: '영어', flag: '🇺🇸' },
      { code: 'ja', name: '일본어', flag: '🇯🇵' },
      { code: 'zh', name: '중국어', flag: '🇨🇳' },
      { code: 'es', name: '스페인어', flag: '🇪🇸' },
      { code: 'fr', name: '프랑스어', flag: '🇫🇷' },
      { code: 'de', name: '독일어', flag: '🇩🇪' },
      { code: 'ru', name: '러시아어', flag: '🇷🇺' }
    ];

    languages.forEach(lang => {
      const item = document.createElement('div');
      item.className = 'language-item';
      item.dataset.lang = lang.code;
      item.innerHTML = `
        <span class="flag">${lang.flag}</span>
        <span class="name">${lang.name}</span>
      `;
      
      // 언어 선택 이벤트
      item.addEventListener('click', () => {
        this.selectLanguage(lang.code);
        this.hideModal();
      });
      
      this.languageGrid.appendChild(item);
    });
  }

  /**
   * 언어 선택
   * @param {string} langCode - 언어 코드
   */
  selectLanguage(langCode) {
    // 선택된 언어 표시 업데이트
    this.updateSelectedLanguage(langCode);
    
    // 언어 변경 이벤트 트리거
    this.triggerLanguageChange(langCode);
  }

  /**
   * 선택된 언어 표시 업데이트
   * @param {string} langCode - 언어 코드
   */
  updateSelectedLanguage(langCode) {
    const languages = {
      'ko': '한국어',
      'en': '영어',
      'ja': '일본어',
      'zh': '중국어',
      'es': '스페인어',
      'fr': '프랑스어',
      'de': '독일어',
      'ru': '러시아어'
    };

    const selectedLang = languages[langCode] || '한국어';
    this.selectedLanguageSpan.textContent = `영어 → ${selectedLang}`;
  }

  /**
   * 언어 변경 이벤트 트리거
   * @param {string} langCode - 언어 코드
   */
  triggerLanguageChange(langCode) {
    const event = new CustomEvent('languageChanged', { 
      detail: { language: langCode } 
    });
    document.dispatchEvent(event);
  }

  /**
   * 언어 모델로 뷰 렌더링
   * @param {LanguageModel} languageModel - 언어 모델
   */
  render(languageModel) {
    this.languageModel = languageModel;
    this.updateSelectedLanguage(languageModel.getSelectedLanguage());
  }

  /**
   * 뷰 렌더링
   */
  renderView() {
    // 언어 선택 버튼이 없으면 생성
    if (!document.getElementById('languageBtn')) {
      const container = document.querySelector('.language-setting') || document.body;
      container.appendChild(this.languageBtn);
    }
    
    // 모달이 없으면 생성
    if (!document.getElementById('languageModal')) {
      document.body.appendChild(this.modal);
    }
  }

  /**
   * 현재 선택된 언어 반환
   * @returns {string} 현재 선택된 언어 코드
   */
  getSelectedLanguage() {
    const selectedItem = this.languageGrid?.querySelector('.language-item.selected');
    return selectedItem?.dataset.lang || 'ko';
  }

  /**
   * 언어 선택 상태 업데이트
   * @param {string} langCode - 언어 코드
   */
  updateSelection(langCode) {
    // 모든 선택 상태 제거
    this.languageGrid?.querySelectorAll('.language-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    // 선택된 언어에 selected 클래스 추가
    const selectedItem = this.languageGrid?.querySelector(`[data-lang="${langCode}"]`);
    if (selectedItem) {
      selectedItem.classList.add('selected');
    }
  }

  /**
   * 뷰 초기화
   */
  reset() {
    this.updateSelectedLanguage('ko');
    this.hideModal();
  }
}
