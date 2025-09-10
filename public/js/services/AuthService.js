/**
 * 인증 서비스
 * Google OAuth API와 통신합니다.
 */
class AuthService {
  constructor() {
    this.baseURL = '/api/auth';
    this.googleAuthURL = `${this.baseURL}/google`;
  }

  /**
   * Google OAuth 로그인 시작
   * @returns {Promise<void>}
   */
  async loginWithGoogle() {
    try {
      // Google OAuth 페이지로 리다이렉트
      window.location.href = this.googleAuthURL;
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      throw new Error('Google 로그인을 시작할 수 없습니다.');
    }
  }

  /**
   * JWT 토큰 검증
   * @param {string} token - JWT 토큰
   * @returns {Promise<Object>} 검증 결과
   */
  async verifyToken(token) {
    try {
      const response = await fetch(`${this.baseURL}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('토큰 검증 오류:', error);
      throw new Error('토큰 검증에 실패했습니다.');
    }
  }

  /**
   * 로그아웃
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      const response = await fetch(`${this.baseURL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('로그아웃 오류:', error);
      throw new Error('로그아웃에 실패했습니다.');
    }
  }

  /**
   * URL에서 토큰 추출
   * @returns {string|null} JWT 토큰
   */
  extractTokenFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // URL에서 토큰 제거
      const url = new URL(window.location);
      url.searchParams.delete('token');
      window.history.replaceState({}, document.title, url);
    }
    
    return token;
  }

  /**
   * 사용자 프로필 이미지 URL 생성
   * @param {string} picture - Google 프로필 이미지 URL
   * @param {number} size - 이미지 크기 (기본값: 40)
   * @returns {string} 최적화된 이미지 URL
   */
  getProfileImageURL(picture, size = 40) {
    if (!picture) return null;
    
    // Google 프로필 이미지 크기 조정
    if (picture.includes('googleusercontent.com')) {
      return `${picture}?sz=${size}`;
    }
    
    return picture;
  }

  /**
   * 사용자 이름 표시용 포맷팅
   * @param {Object} user - 사용자 정보
   * @returns {string} 포맷팅된 이름
   */
  formatUserName(user) {
    if (!user) return '사용자';
    
    // 이름이 있으면 이름 사용, 없으면 이메일 사용
    return user.name || user.email || '사용자';
  }

  /**
   * 사용자 이메일 표시용 포맷팅
   * @param {Object} user - 사용자 정보
   * @returns {string} 포맷팅된 이메일
   */
  formatUserEmail(user) {
    if (!user || !user.email) return '';
    
    // 이메일 길이가 길면 축약
    if (user.email.length > 30) {
      const [local, domain] = user.email.split('@');
      return `${local.substring(0, 10)}...@${domain}`;
    }
    
    return user.email;
  }
}

// 전역 인스턴스 생성
window.authService = new AuthService();
