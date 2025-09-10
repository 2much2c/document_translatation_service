/**
 * 인증 데이터 모델
 * 사용자 인증 상태와 정보를 관리합니다.
 */
class AuthModel {
  constructor() {
    this.isAuthenticated = false;
    this.user = null;
    this.token = null;
    this.provider = null;
    
    // 로컬 스토리지에서 토큰 복원
    this.loadFromStorage();
  }

  /**
   * 로그인 상태 설정
   * @param {Object} userData - 사용자 데이터
   * @param {string} token - JWT 토큰
   * @param {string} provider - 인증 제공자
   */
  setAuthenticated(userData, token, provider = 'google') {
    this.isAuthenticated = true;
    this.user = userData;
    this.token = token;
    this.provider = provider;
    
    // 로컬 스토리지에 저장
    this.saveToStorage();
    
    // 이벤트 발생
    window.eventBus.emit('auth:login', {
      user: this.user,
      provider: this.provider
    });
  }

  /**
   * 로그아웃
   */
  logout() {
    this.isAuthenticated = false;
    this.user = null;
    this.token = null;
    this.provider = null;
    
    // 로컬 스토리지에서 제거
    this.clearStorage();
    
    // 이벤트 발생
    window.eventBus.emit('auth:logout');
  }

  /**
   * 사용자 정보 업데이트
   * @param {Object} userData - 새로운 사용자 데이터
   */
  updateUser(userData) {
    if (this.isAuthenticated) {
      this.user = { ...this.user, ...userData };
      this.saveToStorage();
      
      // 이벤트 발생
      window.eventBus.emit('auth:userUpdated', {
        user: this.user
      });
    }
  }

  /**
   * 토큰 유효성 검사
   * @returns {boolean} 토큰이 유효한지 여부
   */
  isTokenValid() {
    if (!this.token) return false;
    
    try {
      // JWT 토큰 디코딩하여 만료 시간 확인
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch (error) {
      console.error('토큰 검증 오류:', error);
      return false;
    }
  }

  /**
   * 로컬 스토리지에서 데이터 로드
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('auth_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.isAuthenticated = data.isAuthenticated;
        this.user = data.user;
        this.token = data.token;
        this.provider = data.provider;
        
        // 토큰 유효성 검사
        if (this.isAuthenticated && !this.isTokenValid()) {
          this.logout();
        }
      }
    } catch (error) {
      console.error('저장된 인증 데이터 로드 오류:', error);
      this.clearStorage();
    }
  }

  /**
   * 로컬 스토리지에 데이터 저장
   */
  saveToStorage() {
    try {
      const data = {
        isAuthenticated: this.isAuthenticated,
        user: this.user,
        token: this.token,
        provider: this.provider
      };
      localStorage.setItem('auth_data', JSON.stringify(data));
    } catch (error) {
      console.error('인증 데이터 저장 오류:', error);
    }
  }

  /**
   * 로컬 스토리지에서 데이터 제거
   */
  clearStorage() {
    try {
      localStorage.removeItem('auth_data');
    } catch (error) {
      console.error('인증 데이터 제거 오류:', error);
    }
  }

  /**
   * 사용자 정보 반환
   * @returns {Object|null} 사용자 정보
   */
  getUser() {
    return this.user;
  }

  /**
   * 인증 상태 반환
   * @returns {boolean} 인증 여부
   */
  getAuthStatus() {
    return this.isAuthenticated;
  }

  /**
   * 토큰 반환
   * @returns {string|null} JWT 토큰
   */
  getToken() {
    return this.token;
  }

  /**
   * 인증 제공자 반환
   * @returns {string|null} 인증 제공자
   */
  getProvider() {
    return this.provider;
  }
}

// 전역 인스턴스 생성
window.authModel = new AuthModel();
