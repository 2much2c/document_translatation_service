/**
 * ModalView - 모달 뷰
 * MVC 패턴의 View 역할
 */
class ModalView {
  constructor() {
    this.modals = new Map();
    this.activeModal = null;
    this.init();
  }

  /**
   * 뷰 초기화
   */
  init() {
    this.bindEvents();
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.hide(this.activeModal);
      }
    });

    // 모달 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.hide(e.target);
      }
    });
  }

  /**
   * 모달 생성
   * @param {string} id - 모달 ID
   * @param {Object} options - 모달 옵션
   * @returns {HTMLElement} 모달 요소
   */
  create(id, options = {}) {
    const {
      title = '모달',
      content = '',
      showClose = true,
      showFooter = false,
      footerContent = '',
      size = 'medium',
      className = ''
    } = options;

    const modal = document.createElement('div');
    modal.id = id;
    modal.className = `modal ${className}`;
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="modal-content modal-${size}">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          ${showClose ? '<span class="modal-close">&times;</span>' : ''}
        </div>
        <div class="modal-body">
          ${content}
        </div>
        ${showFooter ? `
          <div class="modal-footer">
            ${footerContent}
          </div>
        ` : ''}
      </div>
    `;

    // 닫기 버튼 이벤트
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hide(modal);
      });
    }

    this.modals.set(id, modal);
    document.body.appendChild(modal);
    return modal;
  }

  /**
   * 모달 표시
   * @param {string|HTMLElement} modal - 모달 ID 또는 요소
   */
  show(modal) {
    const modalElement = typeof modal === 'string' ? this.modals.get(modal) : modal;
    
    if (!modalElement) {
      console.error('모달을 찾을 수 없습니다:', modal);
      return;
    }

    // 이전 모달 숨김
    if (this.activeModal && this.activeModal !== modalElement) {
      this.hide(this.activeModal);
    }

    modalElement.style.display = 'flex';
    this.activeModal = modalElement;
    document.body.style.overflow = 'hidden';

    // 애니메이션
    setTimeout(() => {
      modalElement.classList.add('show');
    }, 10);
  }

  /**
   * 모달 숨김
   * @param {string|HTMLElement} modal - 모달 ID 또는 요소
   */
  hide(modal) {
    const modalElement = typeof modal === 'string' ? this.modals.get(modal) : modal;
    
    if (!modalElement) {
      console.error('모달을 찾을 수 없습니다:', modal);
      return;
    }

    modalElement.classList.remove('show');
    
    setTimeout(() => {
      modalElement.style.display = 'none';
      if (this.activeModal === modalElement) {
        this.activeModal = null;
      }
      document.body.style.overflow = 'auto';
    }, 300);
  }

  /**
   * 모달 토글
   * @param {string|HTMLElement} modal - 모달 ID 또는 요소
   */
  toggle(modal) {
    const modalElement = typeof modal === 'string' ? this.modals.get(modal) : modal;
    
    if (!modalElement) {
      console.error('모달을 찾을 수 없습니다:', modal);
      return;
    }

    if (modalElement.style.display === 'none') {
      this.show(modalElement);
    } else {
      this.hide(modalElement);
    }
  }

  /**
   * 모달 내용 업데이트
   * @param {string|HTMLElement} modal - 모달 ID 또는 요소
   * @param {string} content - 새로운 내용
   */
  updateContent(modal, content) {
    const modalElement = typeof modal === 'string' ? this.modals.get(modal) : modal;
    
    if (!modalElement) {
      console.error('모달을 찾을 수 없습니다:', modal);
      return;
    }

    const body = modalElement.querySelector('.modal-body');
    if (body) {
      body.innerHTML = content;
    }
  }

  /**
   * 모달 제목 업데이트
   * @param {string|HTMLElement} modal - 모달 ID 또는 요소
   * @param {string} title - 새로운 제목
   */
  updateTitle(modal, title) {
    const modalElement = typeof modal === 'string' ? this.modals.get(modal) : modal;
    
    if (!modalElement) {
      console.error('모달을 찾을 수 없습니다:', modal);
      return;
    }

    const titleElement = modalElement.querySelector('.modal-title');
    if (titleElement) {
      titleElement.textContent = title;
    }
  }

  /**
   * 확인 모달 생성
   * @param {string} message - 메시지
   * @param {Function} onConfirm - 확인 콜백
   * @param {Function} onCancel - 취소 콜백
   * @returns {HTMLElement} 모달 요소
   */
  createConfirm(message, onConfirm, onCancel) {
    const modal = this.create('confirmModal', {
      title: '확인',
      content: `<p>${message}</p>`,
      showFooter: true,
      footerContent: `
        <button class="btn btn-secondary" id="cancelBtn">취소</button>
        <button class="btn btn-primary" id="confirmBtn">확인</button>
      `,
      size: 'small'
    });

    // 이벤트 바인딩
    const confirmBtn = modal.querySelector('#confirmBtn');
    const cancelBtn = modal.querySelector('#cancelBtn');

    confirmBtn.addEventListener('click', () => {
      if (onConfirm) onConfirm();
      this.hide(modal);
    });

    cancelBtn.addEventListener('click', () => {
      if (onCancel) onCancel();
      this.hide(modal);
    });

    return modal;
  }

  /**
   * 알림 모달 생성
   * @param {string} message - 메시지
   * @param {string} type - 알림 타입 (success, error, info, warning)
   * @returns {HTMLElement} 모달 요소
   */
  createAlert(message, type = 'info') {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const modal = this.create('alertModal', {
      title: '알림',
      content: `
        <div class="alert-content">
          <div class="alert-icon">${icons[type] || icons.info}</div>
          <p>${message}</p>
        </div>
      `,
      showFooter: true,
      footerContent: '<button class="btn btn-primary" id="okBtn">확인</button>',
      size: 'small',
      className: `alert-${type}`
    });

    // 확인 버튼 이벤트
    const okBtn = modal.querySelector('#okBtn');
    okBtn.addEventListener('click', () => {
      this.hide(modal);
    });

    return modal;
  }

  /**
   * 로딩 모달 생성
   * @param {string} message - 로딩 메시지
   * @returns {HTMLElement} 모달 요소
   */
  createLoading(message = '처리 중...') {
    const modal = this.create('loadingModal', {
      title: '',
      content: `
        <div class="loading-content">
          <div class="spinner"></div>
          <p>${message}</p>
        </div>
      `,
      showClose: false,
      showFooter: false,
      size: 'small',
      className: 'loading-modal'
    });

    return modal;
  }

  /**
   * 모든 모달 숨김
   */
  hideAll() {
    this.modals.forEach(modal => {
      this.hide(modal);
    });
  }

  /**
   * 모달 제거
   * @param {string|HTMLElement} modal - 모달 ID 또는 요소
   */
  remove(modal) {
    const modalElement = typeof modal === 'string' ? this.modals.get(modal) : modal;
    
    if (!modalElement) {
      console.error('모달을 찾을 수 없습니다:', modal);
      return;
    }

    this.hide(modalElement);
    
    if (typeof modal === 'string') {
      this.modals.delete(modal);
    } else {
      const id = modalElement.id;
      if (id) {
        this.modals.delete(id);
      }
    }
    
    document.body.removeChild(modalElement);
  }

  /**
   * 모든 모달 제거
   */
  removeAll() {
    this.modals.forEach((modal, id) => {
      this.remove(modal);
    });
  }

  /**
   * 모달 존재 여부 확인
   * @param {string} id - 모달 ID
   * @returns {boolean} 존재 여부
   */
  exists(id) {
    return this.modals.has(id);
  }

  /**
   * 활성 모달 반환
   * @returns {HTMLElement|null} 활성 모달
   */
  getActiveModal() {
    return this.activeModal;
  }
}
