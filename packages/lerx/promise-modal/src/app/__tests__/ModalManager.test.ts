import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ModalManager } from '../ModalManager';

describe('ModalManager', () => {
  beforeEach(() => {
    // 각 테스트 전에 ModalManager 초기화
    ModalManager.reset();
  });

  afterEach(() => {
    // 테스트 후 정리
    ModalManager.reset();
  });

  describe('anchored property', () => {
    it('초기 상태에서 anchored는 false여야 함', () => {
      expect(ModalManager.anchored).toBe(false);
    });

    it('reset() 후 anchored는 false여야 함', () => {
      ModalManager.anchor();
      expect(ModalManager.anchored).toBe(true);

      ModalManager.reset();
      expect(ModalManager.anchored).toBe(false);
    });
  });

  describe('style sheet management', () => {
    it('defineStyleSheet()로 스타일을 정의할 수 있어야 함', () => {
      ModalManager.defineStyleSheet('test-style', '.test { color: red; }');

      // 내부적으로 스타일이 저장되었는지 확인 (에러 없이 실행)
      expect(() =>
        ModalManager.defineStyleSheet('test-style', '.test { color: blue; }'),
      ).not.toThrow();
    });

    it('applyStyleSheet()가 에러 없이 실행되어야 함', () => {
      ModalManager.defineStyleSheet('test-style', '.test { color: red; }');

      expect(() => ModalManager.applyStyleSheet()).not.toThrow();
    });

    it('여러 스타일을 정의하고 적용할 수 있어야 함', () => {
      ModalManager.defineStyleSheet('style1', '.class1 { color: red; }');
      ModalManager.defineStyleSheet('style2', '.class2 { color: blue; }');

      expect(() => ModalManager.applyStyleSheet()).not.toThrow();
    });

    it('getHashedClassNames()가 해시된 클래스명을 반환해야 함', () => {
      const hashed1 = ModalManager.getHashedClassNames('modal');
      const hashed2 = ModalManager.getHashedClassNames('modal');

      expect(hashed1).toBe(hashed2); // 동일한 styleId는 동일한 해시
      expect(hashed1).toContain('modal-');
    });

    it('다른 styleId는 다른 해시를 생성해야 함', () => {
      const hashed1 = ModalManager.getHashedClassNames('modal');
      const hashed2 = ModalManager.getHashedClassNames('backdrop');

      expect(hashed1).not.toBe(hashed2);
    });
  });

  describe('prerender list', () => {
    it('초기 prerender 리스트는 비어있어야 함', () => {
      expect(ModalManager.prerender).toEqual([]);
    });

    it('기본 openHandler는 prerender 리스트에 추가해야 함', () => {
      const modal = {
        type: 'alert' as const,
        title: 'Test',
      };

      const initialLength = ModalManager.prerender.length;
      ModalManager.open(modal);

      expect(ModalManager.prerender.length).toBe(initialLength + 1);
    });
  });

  describe('openHandler', () => {
    it('openHandler를 커스텀으로 설정할 수 있어야 함', () => {
      const customHandler = vi.fn((modal) => ({
        id: 999,
        initiator: 'test',
        type: modal.type,
        alive: true,
        visible: false,
        onConfirm: vi.fn(),
        onClose: vi.fn(),
        onDestroy: vi.fn(),
        onShow: vi.fn(),
        onHide: vi.fn(),
        subscribe: vi.fn(() => () => {}),
        publish: vi.fn(),
        onResolve: vi.fn(),
        ...modal,
      }));

      ModalManager.openHandler = customHandler;

      const modal = {
        type: 'alert' as const,
        title: 'Test',
      };

      ModalManager.open(modal);

      expect(customHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'alert',
          title: 'Test',
        }),
      );
    });

    it('openHandler 설정 시 prerender 리스트가 초기화되어야 함', () => {
      // 먼저 모달을 추가
      ModalManager.open({ type: 'alert', title: 'Test' });
      expect(ModalManager.prerender.length).toBeGreaterThan(0);

      // openHandler 설정
      ModalManager.openHandler = vi.fn();

      // prerender 리스트가 초기화되어야 함
      expect(ModalManager.prerender.length).toBe(0);
    });
  });

  describe('rerenderHandler', () => {
    it('rerenderHandler를 설정할 수 있어야 함', () => {
      const handler = vi.fn();
      ModalManager.refreshHandler = handler;

      ModalManager.refresh();

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('rerenderHandler가 없으면 rerender()가 에러를 발생시키지 않아야 함', () => {
      expect(() => ModalManager.refresh()).not.toThrow();
    });
  });

  describe('reset', () => {
    it('reset()이 모든 상태를 초기화해야 함', () => {
      // 스타일 정의
      ModalManager.defineStyleSheet('test', '.test { color: red; }');

      // 모달 추가
      ModalManager.open({
        type: 'alert',
        title: 'Test',
      });

      // reset
      ModalManager.reset();

      // 상태 확인
      expect(ModalManager.anchored).toBe(false);
      expect(ModalManager.prerender).toEqual([]);
    });

    it('reset() 후 기본 openHandler가 복원되어야 함', () => {
      // 커스텀 handler 설정
      ModalManager.openHandler = vi.fn();

      // reset
      ModalManager.reset();

      // 기본 동작 확인: prerender 리스트에 추가
      const initialLength = ModalManager.prerender.length;
      ModalManager.open({ type: 'alert', title: 'Test' });
      expect(ModalManager.prerender.length).toBe(initialLength + 1);
    });
  });

  describe('integration scenarios', () => {
    it('전체 초기화 플로우가 정상 동작해야 함', () => {
      // 1. 스타일 정의 및 적용
      ModalManager.defineStyleSheet('modal', '.modal { display: block; }');
      ModalManager.defineStyleSheet(
        'backdrop',
        '.backdrop { background: rgba(0,0,0,0.5); }',
      );
      expect(() => ModalManager.applyStyleSheet()).not.toThrow();

      // 2. 해시된 클래스명 생성
      const modalClass = ModalManager.getHashedClassNames('modal');
      const backdropClass = ModalManager.getHashedClassNames('backdrop');

      expect(modalClass).toContain('modal-');
      expect(backdropClass).toContain('backdrop-');
      expect(modalClass).not.toBe(backdropClass);
    });

    it('여러 번 초기화해도 문제없어야 함', () => {
      for (let i = 0; i < 3; i++) {
        ModalManager.reset();
        expect(ModalManager.anchored).toBe(false);
        expect(ModalManager.prerender).toEqual([]);
      }
    });
  });
});
