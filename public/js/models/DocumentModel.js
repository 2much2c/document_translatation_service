/**
 * DocumentModel - 문서 데이터 모델
 * MVC 패턴의 Model 역할
 */
class DocumentModel {
  constructor() {
    this.currentFile = null;
    this.extractedText = '';
    this.translation = '';
    this.summary = '';
    this.processing = false;
    this.error = null;
  }

  /**
   * 파일 설정
   * @param {File} file - 업로드된 파일
   */
  setFile(file) {
    this.currentFile = file;
    this.extractedText = '';
    this.translation = '';
    this.summary = '';
    this.error = null;
  }

  /**
   * 추출된 텍스트 설정
   * @param {string} text - 추출된 텍스트
   */
  setExtractedText(text) {
    this.extractedText = text;
  }

  /**
   * 번역 결과 설정
   * @param {string} translation - 번역된 텍스트
   */
  setTranslation(translation) {
    this.translation = translation;
  }

  /**
   * 요약 결과 설정
   * @param {string} summary - 요약된 텍스트
   */
  setSummary(summary) {
    this.summary = summary;
  }

  /**
   * 처리 상태 설정
   * @param {boolean} processing - 처리 중 여부
   */
  setProcessing(processing) {
    this.processing = processing;
  }

  /**
   * 에러 설정
   * @param {string} error - 에러 메시지
   */
  setError(error) {
    this.error = error;
  }

  /**
   * 현재 파일 반환
   * @returns {File|null} 현재 파일
   */
  getFile() {
    return this.currentFile;
  }

  /**
   * 추출된 텍스트 반환
   * @returns {string} 추출된 텍스트
   */
  getExtractedText() {
    return this.extractedText;
  }

  /**
   * 번역 결과 반환
   * @returns {string} 번역된 텍스트
   */
  getTranslation() {
    return this.translation;
  }

  /**
   * 요약 결과 반환
   * @returns {string} 요약된 텍스트
   */
  getSummary() {
    return this.summary;
  }

  /**
   * 처리 중 여부 반환
   * @returns {boolean} 처리 중 여부
   */
  isProcessing() {
    return this.processing;
  }

  /**
   * 에러 반환
   * @returns {string|null} 에러 메시지
   */
  getError() {
    return this.error;
  }

  /**
   * 파일 크기 포맷팅
   * @param {number} bytes - 바이트 크기
   * @returns {string} 포맷된 크기
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 파일 정보 반환
   * @returns {Object|null} 파일 정보
   */
  getFileInfo() {
    if (!this.currentFile) return null;
    
    return {
      name: this.currentFile.name,
      size: this.formatFileSize(this.currentFile.size),
      type: this.currentFile.type,
      lastModified: this.currentFile.lastModified
    };
  }

  /**
   * 모델 초기화
   */
  reset() {
    this.currentFile = null;
    this.extractedText = '';
    this.translation = '';
    this.summary = '';
    this.processing = false;
    this.error = null;
  }
}
