/**
 * DocumentController - 문서 처리 컨트롤러
 * MVC 패턴의 Controller 역할
 */
class DocumentController {
  constructor(documentModel, uploadView, resultView) {
    this.documentModel = documentModel;
    this.uploadView = uploadView;
    this.resultView = resultView;
    
    // 서비스 초기화
    this.apiService = new APIService();
    this.fileService = new FileService();
    this.storageService = new StorageService();
    
    this.init();
  }

  /**
   * 컨트롤러 초기화
   */
  init() {
    this.bindEvents();
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 파일 업로드 이벤트
    document.addEventListener('fileUploaded', (e) => {
      this.handleFileUpload(e.detail.file);
    });

    // 다시하기 이벤트
    document.addEventListener('retryRequested', () => {
      this.handleRetry();
    });

    // 언어 변경 이벤트
    document.addEventListener('languageChanged', (e) => {
      this.handleLanguageChange(e.detail.language);
    });
  }

  /**
   * 파일 업로드 처리
   * @param {File} file - 업로드된 파일
   */
  async handleFileUpload(file) {
    try {
      // 파일 유효성 검사
      const validation = this.fileService.validateFile(file);
      if (!validation.valid) {
        this.uploadView.showError(validation.errors.join(', '));
        return;
      }

      // 모델 업데이트
      this.documentModel.setFile(file);
      this.documentModel.setProcessing(true);

      // 처리 중 상태 표시
      this.uploadView.showProcessing('파일을 분석하고 있습니다...');

      // 텍스트 추출
      const extractedText = await this.fileService.extractText(file);
      this.documentModel.setExtractedText(extractedText);

      // 처리 중 상태 업데이트
      this.uploadView.showProcessing('AI가 번역과 요약을 처리하고 있습니다...');

      // 자동 처리 (번역 + 요약)
      await this.processDocument(extractedText);

    } catch (error) {
      console.error('파일 처리 중 오류:', error);
      this.handleError(error);
    }
  }

  /**
   * 문서 처리 (번역 + 요약)
   * @param {string} text - 처리할 텍스트
   */
  async processDocument(text) {
    try {
      // 현재 설정 가져오기
      const settings = this.storageService.getSettings();
      const language = this.storageService.getLanguage();

      // 번역과 요약을 동시에 실행
      const results = await this.apiService.processDocument(
        text,
        language,
        settings.summaryMethod,
        settings.sentenceCount
      );

      // 모델 업데이트
      this.documentModel.setTranslation(results.translation);
      this.documentModel.setSummary(results.summary);
      this.documentModel.setProcessing(false);

      // 결과 표시
      this.resultView.render(this.documentModel);

      // 히스토리 저장
      this.saveToHistory();

      // 처리 완료 상태 표시
      this.uploadView.hideProcessing();

    } catch (error) {
      console.error('문서 처리 중 오류:', error);
      this.handleError(error);
    }
  }

  /**
   * 언어 변경 처리
   * @param {string} language - 새로운 언어
   */
  handleLanguageChange(language) {
    // 언어 설정 저장
    this.storageService.saveLanguage(language);
    
    // 현재 문서가 있으면 다시 처리
    if (this.documentModel.getExtractedText()) {
      this.processDocument(this.documentModel.getExtractedText());
    }
  }

  /**
   * 다시하기 처리
   */
  handleRetry() {
    // 모델 초기화
    this.documentModel.reset();
    
    // 뷰 초기화
    this.uploadView.reset();
    this.resultView.reset();
  }

  /**
   * 에러 처리
   * @param {Error} error - 에러 객체
   */
  handleError(error) {
    this.documentModel.setError(error.message);
    this.documentModel.setProcessing(false);
    
    // 에러 표시
    this.uploadView.showError(error.message);
    this.resultView.showError(error.message);
    
    // 처리 중 상태 숨김
    this.uploadView.hideProcessing();
  }

  /**
   * 히스토리 저장
   */
  saveToHistory() {
    const fileInfo = this.documentModel.getFileInfo();
    if (!fileInfo) return;

    const history = {
      fileName: fileInfo.name,
      fileSize: fileInfo.size,
      extractedText: this.documentModel.getExtractedText(),
      translation: this.documentModel.getTranslation(),
      summary: this.documentModel.getSummary(),
      language: this.storageService.getLanguage(),
      timestamp: Date.now()
    };

    this.storageService.saveHistory(history);
  }

  /**
   * 히스토리에서 문서 복원
   * @param {Object} history - 히스토리 객체
   */
  restoreFromHistory(history) {
    // 모델 업데이트
    this.documentModel.setExtractedText(history.extractedText);
    this.documentModel.setTranslation(history.translation);
    this.documentModel.setSummary(history.summary);

    // 결과 표시
    this.resultView.render(this.documentModel);
  }

  /**
   * 현재 문서 상태 반환
   * @returns {Object} 문서 상태
   */
  getDocumentState() {
    return {
      hasFile: !!this.documentModel.getFile(),
      hasText: !!this.documentModel.getExtractedText(),
      hasTranslation: !!this.documentModel.getTranslation(),
      hasSummary: !!this.documentModel.getSummary(),
      isProcessing: this.documentModel.isProcessing(),
      error: this.documentModel.getError()
    };
  }

  /**
   * 문서 처리 통계 반환
   * @returns {Object} 처리 통계
   */
  getProcessingStats() {
    const state = this.getDocumentState();
    const fileInfo = this.documentModel.getFileInfo();
    
    return {
      fileName: fileInfo?.name || 'N/A',
      fileSize: fileInfo?.formattedSize || 'N/A',
      textLength: this.documentModel.getExtractedText().length,
      translationLength: this.documentModel.getTranslation().length,
      summaryLength: this.documentModel.getSummary().length,
      processingTime: this.calculateProcessingTime(),
      language: this.storageService.getLanguage()
    };
  }

  /**
   * 처리 시간 계산
   * @returns {number} 처리 시간 (밀리초)
   */
  calculateProcessingTime() {
    // 실제 구현에서는 시작 시간을 저장하고 계산
    return 0;
  }

  /**
   * 컨트롤러 초기화
   */
  reset() {
    this.documentModel.reset();
    this.uploadView.reset();
    this.resultView.reset();
  }
}
