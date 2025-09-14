/**
 * 인증 서비스
 * Google OAuth JavaScript SDK를 사용합니다.
 */
class AuthService {
  constructor() {
    this.googleClientId = '575127200458-rt8jhis78tsuihvc6u7iag0lgt019coa.apps.googleusercontent.com';
    this.isGoogleSDKLoaded = false;
    this.initGoogleSDK();
  }

  /**
   * Google SDK 초기화
   */
  initGoogleSDK() {
    if (typeof google !== 'undefined' && google.accounts) {
      this.isGoogleSDKLoaded = true;
      this.initializeGoogleSignIn();
    } else {
      // SDK 로딩 대기
      window.addEventListener('load', () => {
        if (typeof google !== 'undefined' && google.accounts) {
          this.isGoogleSDKLoaded = true;
          this.initializeGoogleSignIn();
        }
      });
    }
  }

  /**
   * Google Sign-In 초기화
   */
  initializeGoogleSignIn() {
    if (!this.isGoogleSDKLoaded) return;

    google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: this.handleGoogleResponse.bind(this)
    });
  }

  /**
   * Google OAuth 로그인 시작
   * @returns {Promise<void>}
   */
  async loginWithGoogle() {
    try {
      if (!this.isGoogleSDKLoaded) {
        throw new Error('Google SDK가 로드되지 않았습니다.');
      }

      // Google One Tap 또는 팝업 로그인
      google.accounts.id.prompt();
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      throw new Error('Google 로그인을 시작할 수 없습니다.');
    }
  }

  /**
   * Google 응답 처리
   * @param {Object} response - Google OAuth 응답
   */
  handleGoogleResponse(response) {
    try {
      // JWT 토큰 디코딩
      const payload = this.decodeJWT(response.credential);
      
      // 사용자 정보 추출
      const userData = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        provider: 'google'
      };

      // 로그인 이벤트 발생
      window.eventBus.emit('auth:login', {
        user: userData,
        provider: 'google'
      });

      console.log('Google 로그인 성공:', userData);
    } catch (error) {
      console.error('Google 응답 처리 오류:', error);
      window.eventBus.emit('app:error', '로그인 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * JWT 토큰 디코딩
   * @param {string} token - JWT 토큰
   * @returns {Object} 디코딩된 페이로드
   */
  decodeJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('JWT 토큰 디코딩 실패');
    }
  }

  /**
   * JWT 토큰 검증 (클라이언트 사이드)
   * @param {string} token - JWT 토큰
   * @returns {Promise<Object>} 검증 결과
   */
  async verifyToken(token) {
    try {
      // 클라이언트 사이드에서 JWT 검증
      const payload = this.decodeJWT(token);
      
      // 토큰 만료 시간 확인
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new Error('토큰이 만료되었습니다');
      }

      return {
        valid: true,
        user: {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          provider: 'google'
        }
      };
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
      // Google 계정 로그아웃
      if (this.isGoogleSDKLoaded && google.accounts) {
        google.accounts.id.disableAutoSelect();
      }
      
      return { message: '로그아웃되었습니다' };
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
