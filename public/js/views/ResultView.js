/**
 * ResultView - 결과 표시 뷰
 * MVC 패턴의 View 역할
 */
class ResultView {
  constructor() {
    this.resultSection = null;
    this.originalText = null;
    this.translatedText = null;
    this.summaryText = null;
    this.copyBtn = null;
    this.downloadBtn = null;
    this.retryBtn = null;
    
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
    // 결과 섹션
    this.resultSection = document.getElementById('resultSection') || this.createResultSection();
    
    // 결과 텍스트 요소들
    this.originalText = this.resultSection.querySelector('.original-text');
    this.translatedText = this.resultSection.querySelector('.translated-text');
    this.summaryText = this.resultSection.querySelector('.summary-text');
    
    // 액션 버튼들
    this.copyBtn = this.resultSection.querySelector('.copy-btn');
    this.downloadBtn = this.resultSection.querySelector('.download-btn');
    this.retryBtn = this.resultSection.querySelector('.retry-btn');
  }

  /**
   * 결과 섹션 생성
   * @returns {HTMLElement} 결과 섹션
   */
  createResultSection() {
    const section = document.createElement('section');
    section.id = 'resultSection';
    section.className = 'result-section';
    section.style.display = 'none';
    section.innerHTML = `
      <div class="result-header">
        <h3>📊 처리 결과</h3>
        <div class="result-actions">
          <button class="copy-btn" id="copyBtn">📋 복사</button>
          <button class="download-btn" id="downloadBtn">💾 다운로드</button>
          <button class="retry-btn" id="retryBtn">🔄 다시하기</button>
        </div>
      </div>
      <div class="result-content">
        <div class="result-item original-text">
          <div class="result-label">원문 (영어)</div>
          <div class="result-text"></div>
        </div>
        <div class="result-item translated-text">
          <div class="result-label">번역 (모국어)</div>
          <div class="result-text"></div>
        </div>
        <div class="result-item summary-text">
          <div class="result-label">요약</div>
          <div class="result-text"></div>
        </div>
      </div>
    `;
    return section;
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 복사 버튼
    this.copyBtn?.addEventListener('click', () => {
      this.copyResults();
    });

    // 다운로드 버튼
    this.downloadBtn?.addEventListener('click', () => {
      this.downloadResults();
    });

    // 다시하기 버튼
    this.retryBtn?.addEventListener('click', () => {
      this.retry();
    });
  }

  /**
   * 결과 표시
   * @param {DocumentModel} documentModel - 문서 모델
   */
  render(documentModel) {
    if (!documentModel) return;

    const original = documentModel.getExtractedText();
    const translation = documentModel.getTranslation();
    const summary = documentModel.getSummary();

    // 결과 텍스트 설정
    this.setOriginalText(original);
    this.setTranslatedText(translation);
    this.setSummaryText(summary);

    // 결과 섹션 표시
    this.show();
  }

  /**
   * 원문 텍스트 설정
   * @param {string} text - 원문 텍스트
   */
  setOriginalText(text) {
    if (this.originalText) {
      this.originalText.querySelector('.result-text').textContent = text || '원문이 없습니다.';
    }
  }

  /**
   * 번역 텍스트 설정
   * @param {string} text - 번역 텍스트
   */
  setTranslatedText(text) {
    if (this.translatedText) {
      this.translatedText.querySelector('.result-text').textContent = text || '번역 결과가 없습니다.';
    }
  }

  /**
   * 요약 텍스트 설정
   * @param {string} text - 요약 텍스트
   */
  setSummaryText(text) {
    if (this.summaryText) {
      this.summaryText.querySelector('.result-text').textContent = text || '요약 결과가 없습니다.';
    }
  }

  /**
   * 결과 섹션 표시
   */
  show() {
    this.resultSection.style.display = 'block';
    this.resultSection.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * 결과 섹션 숨김
   */
  hide() {
    this.resultSection.style.display = 'none';
  }

  /**
   * 결과 복사
   */
  async copyResults() {
    try {
      const fileService = new FileService();
      const results = this.getResultsText();
      
      const success = await fileService.copyToClipboard(results);
      
      if (success) {
        this.showToast('결과가 클립보드에 복사되었습니다.');
      } else {
        this.showToast('복사에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('복사 실패:', error);
      this.showToast('복사 중 오류가 발생했습니다.', 'error');
    }
  }

  /**
   * 결과 다운로드
   */
  downloadResults() {
    try {
      const fileService = new FileService();
      const results = this.getResultsText();
      const filename = `document_results_${new Date().toISOString().slice(0, 10)}.txt`;
      
      fileService.downloadFile(results, filename, 'text/plain');
      this.showToast('결과가 다운로드되었습니다.');
    } catch (error) {
      console.error('다운로드 실패:', error);
      this.showToast('다운로드 중 오류가 발생했습니다.', 'error');
    }
  }

  /**
   * 다시하기
   */
  retry() {
    // 다시하기 이벤트 트리거
    const event = new CustomEvent('retryRequested');
    document.dispatchEvent(event);
    
    // 결과 섹션 숨김
    this.hide();
  }

  /**
   * 결과 텍스트 가져오기
   * @returns {string} 결과 텍스트
   */
  getResultsText() {
    const original = this.originalText?.querySelector('.result-text').textContent || '';
    const translation = this.translatedText?.querySelector('.result-text').textContent || '';
    const summary = this.summaryText?.querySelector('.result-text').textContent || '';

    return `=== 원문 (영어) ===\n${original}\n\n=== 번역 (모국어) ===\n${translation}\n\n=== 요약 ===\n${summary}`;
  }

  /**
   * 토스트 메시지 표시
   * @param {string} message - 메시지
   * @param {string} type - 메시지 타입 (success, error, info)
   */
  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // 토스트 스타일
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
      transition: 'all 0.3s ease'
    });

    // 타입별 색상
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      info: '#3b82f6'
    };
    toast.style.backgroundColor = colors[type] || colors.success;

    document.body.appendChild(toast);

    // 애니메이션
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 100);

    // 자동 제거
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  /**
   * 에러 상태 표시
   * @param {string} message - 에러 메시지
   */
  showError(message) {
    this.resultSection.innerHTML = `
      <div class="error-result">
        <div class="error-icon">⚠️</div>
        <div class="error-message">${message}</div>
        <button class="retry-btn" id="retryBtn">다시 시도</button>
      </div>
    `;
    
    // 다시 시도 버튼 이벤트
    const retryBtn = this.resultSection.querySelector('#retryBtn');
    retryBtn.addEventListener('click', () => {
      this.retry();
    });
    
    this.show();
  }

  /**
   * 뷰 초기화
   */
  reset() {
    this.hide();
    this.setOriginalText('');
    this.setTranslatedText('');
    this.setSummaryText('');
  }

  /**
   * 뷰 렌더링
   */
  renderView() {
    if (!document.getElementById('resultSection')) {
      const container = document.querySelector('main') || document.body;
      container.appendChild(this.resultSection);
    }
  }
}
