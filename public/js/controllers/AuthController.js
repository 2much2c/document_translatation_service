/**
 * 인증 컨트롤러
 * 인증 관련 이벤트를 처리합니다.
 */
class AuthController {
  constructor() {
    this.authModel = window.authModel;
    this.authService = window.authService;
    this.authView = window.authView;
    
    this.init();
  }

  /**
   * 초기화
   */
  init() {
    this.bindEvents();
    this.handleInitialAuth();
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 로그인 요청
    window.eventBus.on('auth:loginRequested', (data) => {
      this.handleLoginRequest(data);
    });

    // 로그아웃 요청
    window.eventBus.on('auth:logoutRequested', () => {
      this.handleLogoutRequest();
    });

    // 로그인 성공
    window.eventBus.on('auth:login', (data) => {
      this.handleLoginSuccess(data);
    });

    // 로그아웃 성공
    window.eventBus.on('auth:logout', () => {
      this.handleLogoutSuccess();
    });

    // 사용자 정보 업데이트
    window.eventBus.on('auth:userUpdated', (data) => {
      this.handleUserUpdated(data);
    });
  }

  /**
   * 초기 인증 상태 처리
   */
  handleInitialAuth() {
    // URL에서 토큰 추출
    const token = this.authService.extractTokenFromURL();
    
    if (token) {
      this.handleTokenFromURL(token);
    } else if (this.authModel.getAuthStatus()) {
      // 저장된 인증 상태가 있으면 UI 업데이트
      this.authView.updateLoginState(this.authModel.getUser());
    }
  }

  /**
   * URL에서 받은 토큰 처리
   * @param {string} token - JWT 토큰
   */
  async handleTokenFromURL(token) {
    try {
      // 토큰 검증
      const result = await this.authService.verifyToken(token);
      
      if (result.valid) {
        // 로그인 상태 설정
        this.authModel.setAuthenticated(
          result.user,
          token,
          result.user.provider
        );
        
        // 성공 메시지 표시
        window.eventBus.emit('app:success', '로그인되었습니다!');
      } else {
        throw new Error('유효하지 않은 토큰입니다.');
      }
    } catch (error) {
      console.error('토큰 처리 오류:', error);
      window.eventBus.emit('app:error', '로그인에 실패했습니다.');
    }
  }

  /**
   * 로그인 요청 처리
   * @param {Object} data - 로그인 데이터
   */
  async handleLoginRequest(data) {
    try {
      if (data.provider === 'google') {
        await this.authService.loginWithGoogle();
      } else {
        throw new Error('지원하지 않는 인증 제공자입니다.');
      }
    } catch (error) {
      console.error('로그인 요청 오류:', error);
      window.eventBus.emit('app:error', '로그인을 시작할 수 없습니다.');
    }
  }

  /**
   * 로그아웃 요청 처리
   */
  async handleLogoutRequest() {
    try {
      // 서버에 로그아웃 요청 (선택사항)
      await this.authService.logout();
      
      // 로컬 로그아웃
      this.authModel.logout();
      
      // 성공 메시지 표시
      window.eventBus.emit('app:success', '로그아웃되었습니다.');
    } catch (error) {
      console.error('로그아웃 요청 오류:', error);
      // 서버 오류가 있어도 로컬 로그아웃은 진행
      this.authModel.logout();
      window.eventBus.emit('app:success', '로그아웃되었습니다.');
    }
  }

  /**
   * 로그인 성공 처리
   * @param {Object} data - 사용자 데이터
   */
  handleLoginSuccess(data) {
    // UI 업데이트
    this.authView.updateLoginState(data.user);
    
    // 헤더에 UI 추가 (아직 추가되지 않은 경우)
    this.authView.addToHeader();
    
    console.log('로그인 성공:', data.user);
  }

  /**
   * 로그아웃 성공 처리
   */
  handleLogoutSuccess() {
    // UI 업데이트
    this.authView.updateLoginState(null);
    
    console.log('로그아웃 성공');
  }

  /**
   * 사용자 정보 업데이트 처리
   * @param {Object} data - 업데이트된 사용자 데이터
   */
  handleUserUpdated(data) {
    // UI 업데이트
    this.authView.updateLoginState(data.user);
    
    console.log('사용자 정보 업데이트:', data.user);
  }

  /**
   * 인증 상태 확인
   * @returns {boolean} 인증 여부
   */
  isAuthenticated() {
    return this.authModel.getAuthStatus();
  }

  /**
   * 사용자 정보 반환
   * @returns {Object|null} 사용자 정보
   */
  getCurrentUser() {
    return this.authModel.getUser();
  }

  /**
   * 토큰 반환
   * @returns {string|null} JWT 토큰
   */
  getToken() {
    return this.authModel.getToken();
  }
}

// 전역 인스턴스 생성
window.authController = new AuthController();
