/**
 * 인증 뷰
 * 로그인/로그아웃 UI를 관리합니다.
 */
class AuthView {
  constructor() {
    this.loginButton = null;
    this.userProfile = null;
    this.authModal = null;
    
    this.init();
  }

  /**
   * 초기화
   */
  init() {
    this.createLoginButton();
    this.createUserProfile();
    this.createAuthModal();
    this.bindEvents();
    this.addToHeader();
  }

  /**
   * 로그인 버튼 생성
   */
  createLoginButton() {
    this.loginButton = document.createElement('button');
    this.loginButton.className = 'btn btn-primary auth-login-btn';
    this.loginButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span>Google로 로그인</span>
    `;
  }

  /**
   * 사용자 프로필 생성
   */
  createUserProfile() {
    this.userProfile = document.createElement('div');
    this.userProfile.className = 'auth-user-profile';
    this.userProfile.style.display = 'none';
    this.userProfile.innerHTML = `
      <div class="user-avatar">
        <img id="userAvatar" src="" alt="프로필" />
      </div>
      <div class="user-info">
        <div class="user-name" id="userName">사용자</div>
        <div class="user-email" id="userEmail">user@example.com</div>
      </div>
      <div class="user-actions">
        <button class="btn btn-outline btn-sm" id="logoutBtn">로그아웃</button>
      </div>
    `;
  }

  /**
   * 인증 모달 생성
   */
  createAuthModal() {
    this.authModal = document.createElement('div');
    this.authModal.className = 'auth-modal';
    this.authModal.style.display = 'none';
    this.authModal.innerHTML = `
      <div class="auth-modal-content">
        <div class="auth-modal-header">
          <h3>로그인</h3>
          <button class="auth-modal-close" id="authModalClose">&times;</button>
        </div>
        <div class="auth-modal-body">
          <p>Google 계정으로 로그인하여 서비스를 이용하세요.</p>
          <div class="auth-providers">
            <button class="btn btn-primary auth-provider-btn" id="googleLoginBtn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google로 로그인</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 로그인 버튼 클릭
    this.loginButton.addEventListener('click', () => {
      this.showAuthModal();
    });

    // Google 로그인 버튼 클릭
    const googleLoginBtn = this.authModal.querySelector('#googleLoginBtn');
    googleLoginBtn.addEventListener('click', () => {
      this.hideAuthModal();
      window.eventBus.emit('auth:loginRequested', { provider: 'google' });
    });

    // 모달 닫기 버튼
    const closeBtn = this.authModal.querySelector('#authModalClose');
    closeBtn.addEventListener('click', () => {
      this.hideAuthModal();
    });

    // 모달 배경 클릭으로 닫기
    this.authModal.addEventListener('click', (e) => {
      if (e.target === this.authModal) {
        this.hideAuthModal();
      }
    });

    // 로그아웃 버튼 클릭
    const logoutBtn = this.userProfile.querySelector('#logoutBtn');
    logoutBtn.addEventListener('click', () => {
      window.eventBus.emit('auth:logoutRequested');
    });
  }

  /**
   * 인증 모달 표시
   */
  showAuthModal() {
    this.authModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  /**
   * 인증 모달 숨기기
   */
  hideAuthModal() {
    this.authModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  /**
   * 로그인 상태 UI 업데이트
   * @param {Object} user - 사용자 정보
   */
  updateLoginState(user) {
    if (user) {
      // 로그인 상태
      this.loginButton.style.display = 'none';
      this.userProfile.style.display = 'flex';
      
      // 사용자 정보 업데이트
      const userName = this.userProfile.querySelector('#userName');
      const userEmail = this.userProfile.querySelector('#userEmail');
      const userAvatar = this.userProfile.querySelector('#userAvatar');
      
      userName.textContent = window.authService.formatUserName(user);
      userEmail.textContent = window.authService.formatUserEmail(user);
      
      if (user.picture) {
        userAvatar.src = window.authService.getProfileImageURL(user.picture);
        userAvatar.style.display = 'block';
      } else {
        userAvatar.style.display = 'none';
      }
    } else {
      // 로그아웃 상태
      this.loginButton.style.display = 'flex';
      this.userProfile.style.display = 'none';
    }
  }

  /**
   * 헤더에 UI 추가
   */
  addToHeader() {
    // DOM이 로드된 후 실행
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.addToHeader();
      });
      return;
    }
    
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
      headerActions.appendChild(this.loginButton);
      headerActions.appendChild(this.userProfile);
    }
    
    // 모달을 body에 추가
    document.body.appendChild(this.authModal);
  }

  /**
   * 로그인 버튼 반환
   * @returns {HTMLElement} 로그인 버튼
   */
  getLoginButton() {
    return this.loginButton;
  }

  /**
   * 사용자 프로필 반환
   * @returns {HTMLElement} 사용자 프로필
   */
  getUserProfile() {
    return this.userProfile;
  }
}

// 전역 인스턴스 생성
window.authView = new AuthView();
