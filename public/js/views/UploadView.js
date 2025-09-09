/**
 * UploadView - 파일 업로드 뷰
 * MVC 패턴의 View 역할
 */
class UploadView {
  constructor() {
    this.uploadArea = null;
    this.fileInput = null;
    this.uploadBtn = null;
    this.fileInfo = null;
    this.processingOverlay = null;
    
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
    // 업로드 영역
    this.uploadArea = document.getElementById('uploadArea') || this.createUploadArea();
    
    // 파일 입력
    this.fileInput = document.getElementById('fileInput') || this.createFileInput();
    
    // 처리 오버레이
    this.processingOverlay = document.getElementById('processingOverlay') || this.createProcessingOverlay();
  }

  /**
   * 업로드 영역 생성
   * @returns {HTMLElement} 업로드 영역 요소
   */
  createUploadArea() {
    const area = document.createElement('div');
    area.id = 'uploadArea';
    area.className = 'upload-area';
    area.innerHTML = `
      <div class="upload-content">
        <div class="upload-icon">📁</div>
        <h3>파일을 드래그하거나 클릭하여 업로드</h3>
        <p>PDF, Word, 이미지, 텍스트 파일 지원</p>
        <button class="upload-btn" id="uploadBtn">파일 선택</button>
      </div>
    `;
    return area;
  }

  /**
   * 파일 입력 생성
   * @returns {HTMLElement} 파일 입력 요소
   */
  createFileInput() {
    const input = document.createElement('input');
    input.id = 'fileInput';
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.bmp';
    input.style.display = 'none';
    return input;
  }

  /**
   * 처리 오버레이 생성
   * @returns {HTMLElement} 처리 오버레이 요소
   */
  createProcessingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'processingOverlay';
    overlay.className = 'processing-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="processing-content">
        <div class="spinner"></div>
        <p class="processing-text">AI가 문서를 처리 중입니다...</p>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      </div>
    `;
    return overlay;
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 업로드 영역 클릭
    this.uploadArea.addEventListener('click', () => {
      this.fileInput.click();
    });

    // 파일 선택
    this.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleFileSelect(file);
      }
    });

    // 드래그 앤 드롭 이벤트
    this.uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.uploadArea.classList.add('drag-over');
    });

    this.uploadArea.addEventListener('dragleave', () => {
      this.uploadArea.classList.remove('drag-over');
    });

    this.uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadArea.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) {
        this.handleFileSelect(file);
      }
    });
  }

  /**
   * 파일 선택 처리
   * @param {File} file - 선택된 파일
   */
  handleFileSelect(file) {
    this.showFileInfo(file);
    this.triggerFileUpload(file);
  }

  /**
   * 파일 정보 표시
   * @param {File} file - 파일
   */
  showFileInfo(file) {
    const fileService = new FileService();
    const fileInfo = fileService.getFileInfo(file);
    const icon = fileService.getFileIcon(file.type);

    this.uploadArea.innerHTML = `
      <div class="file-info">
        <div class="file-icon">${icon}</div>
        <div class="file-details">
          <div class="file-name">${fileInfo.name}</div>
          <div class="file-size">${fileInfo.formattedSize}</div>
        </div>
        <button class="remove-file" id="removeFile">×</button>
      </div>
    `;

    // 파일 제거 버튼 이벤트
    const removeBtn = this.uploadArea.querySelector('#removeFile');
    removeBtn.addEventListener('click', () => {
      this.reset();
    });
  }

  /**
   * 파일 업로드 이벤트 트리거
   * @param {File} file - 업로드할 파일
   */
  triggerFileUpload(file) {
    const event = new CustomEvent('fileUploaded', { 
      detail: { file } 
    });
    document.dispatchEvent(event);
  }

  /**
   * 처리 중 상태 표시
   * @param {string} message - 처리 메시지
   */
  showProcessing(message = 'AI가 문서를 처리 중입니다...') {
    this.processingOverlay.querySelector('.processing-text').textContent = message;
    this.processingOverlay.style.display = 'flex';
  }

  /**
   * 처리 중 상태 숨김
   */
  hideProcessing() {
    this.processingOverlay.style.display = 'none';
  }

  /**
   * 에러 상태 표시
   * @param {string} message - 에러 메시지
   */
  showError(message) {
    this.uploadArea.innerHTML = `
      <div class="error-info">
        <div class="error-icon">⚠️</div>
        <div class="error-message">${message}</div>
        <button class="retry-btn" id="retryBtn">다시 시도</button>
      </div>
    `;

    // 다시 시도 버튼 이벤트
    const retryBtn = this.uploadArea.querySelector('#retryBtn');
    retryBtn.addEventListener('click', () => {
      this.reset();
    });
  }

  /**
   * 뷰 초기화
   */
  reset() {
    this.uploadArea.innerHTML = `
      <div class="upload-content">
        <div class="upload-icon">📁</div>
        <h3>파일을 드래그하거나 클릭하여 업로드</h3>
        <p>PDF, Word, 이미지, 텍스트 파일 지원</p>
        <button class="upload-btn" id="uploadBtn">파일 선택</button>
      </div>
    `;
    
    this.fileInput.value = '';
    this.hideProcessing();
  }

  /**
   * 뷰 렌더링
   */
  render() {
    // 뷰가 이미 렌더링되었는지 확인
    if (!document.getElementById('uploadArea')) {
      const container = document.querySelector('.upload-section') || document.body;
      container.appendChild(this.uploadArea);
    }
    
    if (!document.getElementById('fileInput')) {
      document.body.appendChild(this.fileInput);
    }
    
    if (!document.getElementById('processingOverlay')) {
      document.body.appendChild(this.processingOverlay);
    }
  }

  /**
   * 파일 유효성 검사
   * @param {File} file - 검사할 파일
   * @returns {Object} 검사 결과
   */
  validateFile(file) {
    const fileService = new FileService();
    return fileService.validateFile(file);
  }

  /**
   * 지원하는 파일 타입 반환
   * @returns {Array} 지원하는 파일 타입
   */
  getSupportedTypes() {
    const fileService = new FileService();
    return fileService.getSupportedTypes();
  }
}
