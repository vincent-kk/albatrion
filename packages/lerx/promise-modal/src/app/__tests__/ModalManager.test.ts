import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { nodeFactory } from '@/promise-modal/core';

import { ModalManager } from '../ModalManager';

describe('ModalManager', () => {
  beforeEach(() => {
    ModalManager.reset();
  });

  afterEach(() => {
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
    it('replaces a style definition and removes applied styles on reset', async () => {
      ModalManager.defineStyleSheet('test-style', '.test { color: red; }');

      ModalManager.defineStyleSheet('test-style', '.test { color: blue; }');
      ModalManager.applyStyleSheet();
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      const styles = document.head.textContent;
      expect(styles).toContain('.test{color:blue}');
      expect(styles).not.toContain('.test{color:red}');
      ModalManager.reset();
      expect(document.head.textContent).not.toContain('.test{color:blue}');
    });

    it('applies scoped CSS to the document', async () => {
      ModalManager.defineStyleSheet('test-style', '.test { color: red; }');

      const anchor = ModalManager.anchor();
      ModalManager.applyStyleSheet();
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      expect(document.head.textContent).toContain(
        `.${anchor.className} .test{color:red}`,
      );
    });

    it('applies independent definitions without overwriting either one', async () => {
      ModalManager.defineStyleSheet('style1', '.class1 { color: red; }');
      ModalManager.defineStyleSheet('style2', '.class2 { color: blue; }');

      ModalManager.applyStyleSheet();
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      expect(document.head.textContent).toContain('.class1{color:red}');
      expect(document.head.textContent).toContain('.class2{color:blue}');
    });

    it('getHashedClassNames()가 해시된 클래스명을 반환해야 함', () => {
      const hashed1 = ModalManager.getHashedClassNames('modal');
      const hashed2 = ModalManager.getHashedClassNames('modal');

      expect(hashed1).toBe(hashed2);
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
      const customHandler = vi.fn((modal) =>
        nodeFactory({ ...modal, id: 999, initiator: 'test' }),
      );

      ModalManager.anchor();
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
      ModalManager.open({ type: 'alert', title: 'Test' });
      expect(ModalManager.prerender.length).toBeGreaterThan(0);

      ModalManager.anchor();

      ModalManager.openHandler = vi.fn();

      expect(ModalManager.prerender.length).toBe(0);
    });
  });

  describe('store subscriptions', () => {
    it('notifies subscribers and removes destroyed nodes immediately', () => {
      const handler = vi.fn();
      const unsubscribe = ModalManager.subscribe(handler);
      const node = nodeFactory({
        type: 'alert',
        id: ModalManager.nextId(),
        initiator: '/test',
      });
      ModalManager.register(node);
      expect(ModalManager.ids).toEqual([node.id]);
      node.onDestroy();
      expect(ModalManager.ids).toEqual([]);
      expect(handler).toHaveBeenCalled();
      unsubscribe();
    });
    it('unsubscribes readers without leaving callbacks behind', () => {
      const handler = vi.fn();
      ModalManager.subscribe(handler)();
      ModalManager.reset();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('reset()이 모든 상태를 초기화해야 함', () => {
      ModalManager.defineStyleSheet('test', '.test { color: red; }');

      ModalManager.open({
        type: 'alert',
        title: 'Test',
      });

      // reset
      ModalManager.reset();

      expect(ModalManager.anchored).toBe(false);
      expect(ModalManager.prerender).toEqual([]);
    });

    it('reset() 후 기본 openHandler가 복원되어야 함', () => {
      ModalManager.openHandler = vi.fn();

      // reset
      ModalManager.reset();

      const initialLength = ModalManager.prerender.length;
      ModalManager.open({ type: 'alert', title: 'Test' });
      expect(ModalManager.prerender.length).toBe(initialLength + 1);
    });
  });
});
