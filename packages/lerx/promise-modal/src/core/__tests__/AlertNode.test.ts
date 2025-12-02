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
      expect(node.visible).toBe(true); // 초기에는 visible이 true
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
      // 먼저 visible을 false로 만듦
      node.onHide();
      expect(node.visible).toBe(false);
      node.onShow();
      expect(node.visible).toBe(true);
    });

    it('onHide()가 visible을 false로 변경해야 함', () => {
      // 초기 상태가 이미 visible=true
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

      // visible이 false에서 true로 변경될 때만 publish됨
      node.onHide();
      expect(listener).toHaveBeenCalledTimes(1);

      node.onShow();
      expect(listener).toHaveBeenCalledTimes(2);

      node.onHide();
      expect(listener).toHaveBeenCalledTimes(3);

      // manualDestroy가 false이므로 onDestroy는 publish하지 않음
      node.onDestroy();
      expect(listener).toHaveBeenCalledTimes(3);
    });
  });

  describe('onConfirm', () => {
    it('onConfirm()이 호출되면 handleResolve가 null과 함께 호출되어야 함', () => {
      node.onConfirm();
      expect(handleResolve).toHaveBeenCalledWith(null);
      expect(handleResolve).toHaveBeenCalledTimes(1);
    });

    // Note: onConfirm은 alive를 변경하지 않음 - 이는 ModalManager에서 처리
  });

  describe('onClose', () => {
    it('onClose()가 호출되면 handleResolve가 null과 함께 호출되어야 함', () => {
      node.onClose();
      expect(handleResolve).toHaveBeenCalledWith(null);
      expect(handleResolve).toHaveBeenCalledTimes(1);
    });

    // Note: onClose는 alive를 변경하지 않음 - 이는 ModalManager에서 처리
  });

  describe('alert 특수 케이스', () => {
    it('onConfirm과 onClose가 동일하게 동작해야 함', () => {
      const handleResolve1 = vi.fn();
      const handleResolve2 = vi.fn();
      const node1 = new AlertNode({
        ...alertModal,
        handleResolve: handleResolve1,
      });
      const node2 = new AlertNode({
        ...alertModal,
        handleResolve: handleResolve2,
      });

      node1.onConfirm();
      node2.onClose();

      expect(node1.alive).toBe(node2.alive);
      expect(handleResolve1).toHaveBeenCalledWith(null);
      expect(handleResolve2).toHaveBeenCalledWith(null);
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
