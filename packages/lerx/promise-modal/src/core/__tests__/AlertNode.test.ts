import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AlertNode } from '../node/ModalNode/AlertNode';

describe('AlertNode', () => {
  let alertModal: {
    id: number;
    initiator: string;
    type: 'alert';
    title: string;
    content: string;
    handleResolve: ReturnType<typeof vi.fn>;
  };
  let node: AlertNode<null>;
  let handleResolve: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    handleResolve = vi.fn();
    alertModal = {
      id: 1,
      initiator: 'test',
      type: 'alert',
      title: 'Test Alert',
      content: 'Test Content',
      handleResolve,
    };
    node = new AlertNode(alertModal);
  });

  describe('initialization', () => {
    it('노드가 올바른 초기 상태를 가져야 함', () => {
      expect(node.alive).toBe(true);
      expect(node.visible).toBe(true);
      expect(node.type).toBe('alert');
      expect(node.id).toBe(1);
      expect(node.initiator).toBe('test');
    });

    it('모달 속성을 올바르게 초기화해야 함', () => {
      const nodeWithSubtype = new AlertNode({
        ...alertModal,
        subtype: 'error',
        footer: false,
      });

      expect(nodeWithSubtype.subtype).toBe('error');
      expect(nodeWithSubtype.footer).toBe(false);
    });
  });

  describe('lifecycle methods', () => {
    it('onShow()가 visible을 true로 변경해야 함', () => {
      node.onHide();
      expect(node.visible).toBe(false);
      node.onShow();
      expect(node.visible).toBe(true);
    });

    it('onHide()가 visible을 false로 변경해야 함', () => {
      expect(node.visible).toBe(true);
      node.onHide();
      expect(node.visible).toBe(false);
    });

    it('onDestroy()가 alive를 false로 변경해야 함', () => {
      expect(node.alive).toBe(true);
      node.onDestroy();
      expect(node.alive).toBe(false);
    });

    it('라이프사이클 메서드가 리스너를 트리거해야 함', () => {
      const listener = vi.fn();
      node.subscribe(listener);

      node.onHide();
      expect(listener).toHaveBeenCalledTimes(1);

      node.onShow();
      expect(listener).toHaveBeenCalledTimes(2);

      node.onHide();
      expect(listener).toHaveBeenCalledTimes(3);

      // Destruction publishes both settlement and the alive transition.
      node.onDestroy();
      expect(listener).toHaveBeenCalledTimes(5);
    });
  });

  describe('onConfirm', () => {
    it('onConfirm()이 호출되면 handleResolve가 null과 함께 호출되어야 함', () => {
      node.onConfirm();
      expect(handleResolve).toHaveBeenCalledWith(null);
      expect(handleResolve).toHaveBeenCalledTimes(1);
    });
  });

  describe('onClose', () => {
    it('onClose()가 호출되면 handleResolve가 null과 함께 호출되어야 함', () => {
      node.onClose();
      expect(handleResolve).toHaveBeenCalledWith(null);
      expect(handleResolve).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('handleResolve가 없어도 에러가 발생하지 않아야 함', () => {
      const nodeWithoutResolve = new AlertNode({
        ...alertModal,
        handleResolve: undefined,
      });

      expect(() => nodeWithoutResolve.onConfirm()).not.toThrow();
      expect(() => nodeWithoutResolve.onClose()).not.toThrow();
    });
  });
});
