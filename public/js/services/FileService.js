/**
 * FileService - 파일 처리 서비스
 * MVC 패턴의 Service 역할
 */
class FileService {
  constructor() {
    this.supportedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/bmp'
    ];
    
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
  }

  /**
   * 파일 유효성 검사
   * @param {File} file - 검사할 파일
   * @returns {Object} 검사 결과
   */
  validateFile(file) {
    const result = {
      valid: true,
      errors: []
    };

    // 파일 존재 여부
    if (!file) {
      result.valid = false;
      result.errors.push('파일이 선택되지 않았습니다.');
      return result;
    }

    // 파일 크기 검사
    if (file.size > this.maxFileSize) {
      result.valid = false;
      result.errors.push(`파일 크기가 너무 큽니다. (최대 ${this.formatFileSize(this.maxFileSize)})`);
    }

    // 파일 타입 검사
    if (!this.supportedTypes.includes(file.type)) {
      result.valid = false;
      result.errors.push('지원하지 않는 파일 형식입니다.');
    }

    // 파일명 검사
    if (!file.name || file.name.trim() === '') {
      result.valid = false;
      result.errors.push('파일명이 올바르지 않습니다.');
    }

    return result;
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
   * 파일 정보 추출
   * @param {File} file - 파일
   * @returns {Object} 파일 정보
   */
  getFileInfo(file) {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      formattedSize: this.formatFileSize(file.size)
    };
  }

  /**
   * 텍스트 파일에서 텍스트 추출
   * @param {File} file - 텍스트 파일
   * @returns {Promise<string>} 추출된 텍스트
   */
  async extractTextFromTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.onerror = () => {
        reject(new Error('텍스트 파일 읽기 실패'));
      };
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * 이미지 파일에서 텍스트 추출 (OCR)
   * @param {File} file - 이미지 파일
   * @returns {Promise<string>} 추출된 텍스트
   */
  async extractTextFromImage(file) {
    // 이미지 OCR은 서버에서 처리하므로 API 호출
    const apiService = new APIService();
    return await apiService.uploadFile(file);
  }

  /**
   * 파일에서 텍스트 추출
   * @param {File} file - 파일
   * @returns {Promise<string>} 추출된 텍스트
   */
  async extractText(file) {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    try {
      // 텍스트 파일인 경우 클라이언트에서 처리
      if (file.type === 'text/plain') {
        return await this.extractTextFromTextFile(file);
      }
      
      // 다른 파일 형식은 서버에서 처리
      const apiService = new APIService();
      return await apiService.uploadFile(file);
      
    } catch (error) {
      throw new Error(`텍스트 추출 실패: ${error.message}`);
    }
  }

  /**
   * 파일 다운로드
   * @param {string} content - 다운로드할 내용
   * @param {string} filename - 파일명
   * @param {string} type - MIME 타입
   */
  downloadFile(content, filename, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * 클립보드에 텍스트 복사
   * @param {string} text - 복사할 텍스트
   * @returns {Promise<boolean>} 복사 성공 여부
   */
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // 폴백: 텍스트 영역 사용
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      }
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      return false;
    }
  }

  /**
   * 지원하는 파일 타입 목록 반환
   * @returns {Array} 지원하는 파일 타입
   */
  getSupportedTypes() {
    return this.supportedTypes;
  }

  /**
   * 파일 확장자 목록 반환
   * @returns {Array} 파일 확장자 목록
   */
  getSupportedExtensions() {
    return ['.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.bmp'];
  }

  /**
   * 파일 타입별 아이콘 반환
   * @param {string} mimeType - MIME 타입
   * @returns {string} 아이콘 이모지
   */
  getFileIcon(mimeType) {
    const iconMap = {
      'application/pdf': '📄',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
      'application/msword': '📝',
      'text/plain': '📄',
      'image/png': '🖼️',
      'image/jpeg': '🖼️',
      'image/gif': '🖼️',
      'image/bmp': '🖼️'
    };
    
    return iconMap[mimeType] || '📁';
  }
}
