/**
 * EventBus - 이벤트 기반 통신 시스템
 * 모듈 간 결합도를 낮추고 독립성을 확보
 */
class EventBus {
  constructor() {
    this.events = new Map();
    this.maxListeners = 50;
  }

  /**
   * 이벤트 구독
   * @param {string} event - 이벤트 이름
   * @param {Function} handler - 이벤트 핸들러
   * @param {Object} context - 핸들러 컨텍스트
   */
  on(event, handler, context = null) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listeners = this.events.get(event);
    
    // 최대 리스너 수 제한
    if (listeners.length >= this.maxListeners) {
      console.warn(`EventBus: Maximum listeners (${this.maxListeners}) exceeded for event "${event}"`);
      return;
    }

    listeners.push({
      handler: handler,
      context: context,
      once: false
    });
  }

  /**
   * 이벤트 구독 (한 번만 실행)
   * @param {string} event - 이벤트 이름
   * @param {Function} handler - 이벤트 핸들러
   * @param {Object} context - 핸들러 컨텍스트
   */
  once(event, handler, context = null) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listeners = this.events.get(event);
    listeners.push({
      handler: handler,
      context: context,
      once: true
    });
  }

  /**
   * 이벤트 발행
   * @param {string} event - 이벤트 이름
   * @param {any} data - 이벤트 데이터
   */
  emit(event, data = null) {
    if (!this.events.has(event)) {
      return;
    }

    const listeners = this.events.get(event);
    const toRemove = [];

    listeners.forEach((listener, index) => {
      try {
        if (listener.context) {
          listener.handler.call(listener.context, data);
        } else {
          listener.handler(data);
        }

        if (listener.once) {
          toRemove.push(index);
        }
      } catch (error) {
        console.error(`EventBus: Error in event handler for "${event}":`, error);
      }
    });

    // 한 번만 실행되는 리스너 제거
    toRemove.reverse().forEach(index => {
      listeners.splice(index, 1);
    });
  }

  /**
   * 이벤트 구독 해제
   * @param {string} event - 이벤트 이름
   * @param {Function} handler - 이벤트 핸들러
   * @param {Object} context - 핸들러 컨텍스트
   */
  off(event, handler, context = null) {
    if (!this.events.has(event)) {
      return;
    }

    const listeners = this.events.get(event);
    const filteredListeners = listeners.filter(listener => {
      return !(listener.handler === handler && listener.context === context);
    });

    this.events.set(event, filteredListeners);
  }

  /**
   * 모든 이벤트 구독 해제
   * @param {string} event - 이벤트 이름 (선택사항)
   */
  removeAllListeners(event = null) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * 이벤트 리스너 수 반환
   * @param {string} event - 이벤트 이름
   * @returns {number} 리스너 수
   */
  listenerCount(event) {
    if (!this.events.has(event)) {
      return 0;
    }
    return this.events.get(event).length;
  }

  /**
   * 이벤트 목록 반환
   * @returns {Array} 이벤트 이름 목록
   */
  eventNames() {
    return Array.from(this.events.keys());
  }

  /**
   * 디버그 정보 출력
   */
  debug() {
    console.log('EventBus Debug Info:');
    this.events.forEach((listeners, event) => {
      console.log(`  ${event}: ${listeners.length} listeners`);
    });
  }
}

// 전역 EventBus 인스턴스
window.eventBus = new EventBus();
