import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfirmNode } from '../node/ModalNode/ConfirmNode';

describe('ConfirmNode', () => {
  let confirmModal: {
    id: number;
    initiator: string;
    type: 'confirm';
    title: string;
    content: string;
    handleResolve: ReturnType<typeof vi.fn>;
  };
  let node: ConfirmNode<null>;
  let handleResolve: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    handleResolve = vi.fn();
    confirmModal = {
      id: 1,
      initiator: 'test',
      type: 'confirm',
      title: 'Test Confirm',
      content: 'Are you sure?',
      handleResolve,
    };
    node = new ConfirmNode(confirmModal);
  });

  describe('initialization', () => {
    it('노드가 올바른 초기 상태를 가져야 함', () => {
      expect(node.alive).toBe(true);
      expect(node.visible).toBe(true); // AbstractNode 초기 상태는 visible=true
      expect(node.type).toBe('confirm');
      expect(node.id).toBe(1);
      expect(node.initiator).toBe('test');
    });

    it('모달 속성을 올바르게 초기화해야 함', () => {
      const nodeWithSubtype = new ConfirmNode({
        ...confirmModal,
        subtype: 'warning',
        footer: {
          confirm: 'Yes',
          cancel: 'No',
        },
      });

      expect(nodeWithSubtype.subtype).toBe('warning');
      expect(nodeWithSubtype.footer).toEqual({
        confirm: 'Yes',
        cancel: 'No',
      });
    });
  });

  describe('onConfirm', () => {
    it('onConfirm()이 호출되면 handleResolve가 true와 함께 호출되어야 함', () => {
      node.onConfirm();
      expect(handleResolve).toHaveBeenCalledWith(true);
      expect(handleResolve).toHaveBeenCalledTimes(1);
    });

    // Note: onConfirm은 alive를 변경하지 않음 - 이는 ModalManager에서 처리
    // Note: onConfirm은 리스너를 호출하지 않음 - publish()를 호출하지 않음
  });

  describe('onClose', () => {
    it('onClose()가 호출되면 handleResolve가 false와 함께 호출되어야 함', () => {
      node.onClose();
      expect(handleResolve).toHaveBeenCalledWith(false);
      expect(handleResolve).toHaveBeenCalledTimes(1);
    });

    // Note: onClose는 alive를 변경하지 않음 - 이는 ModalManager에서 처리
    // Note: onClose는 리스너를 호출하지 않음 - publish()를 호출하지 않음
  });

  describe('confirm 특수 케이스', () => {
    it('onConfirm과 onClose가 다른 결과를 반환해야 함', () => {
      const handleResolve1 = vi.fn();
      const handleResolve2 = vi.fn();
      const node1 = new ConfirmNode({
        ...confirmModal,
        handleResolve: handleResolve1,
      });
      const node2 = new ConfirmNode({
        ...confirmModal,
        handleResolve: handleResolve2,
      });

      node1.onConfirm();
      node2.onClose();

      expect(handleResolve1).toHaveBeenCalledWith(true);
      expect(handleResolve2).toHaveBeenCalledWith(false);
    });
  });

  describe('error handling', () => {
    it('handleResolve가 없어도 에러가 발생하지 않아야 함', () => {
      const nodeWithoutResolve = new ConfirmNode({
        ...confirmModal,
        handleResolve: undefined,
      });

      expect(() => nodeWithoutResolve.onConfirm()).not.toThrow();
      expect(() => nodeWithoutResolve.onClose()).not.toThrow();
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
      // 초기 상태는 visible=true
      expect(node.visible).toBe(true);
      node.onHide();
      expect(node.visible).toBe(false);
    });

    it('onDestroy()가 alive를 false로 변경해야 함', () => {
      expect(node.alive).toBe(true);
      node.onDestroy();
      expect(node.alive).toBe(false);
    });
  });

  describe('footer options', () => {
    it('footer가 false이면 footer를 렌더링하지 않아야 함', () => {
      const nodeWithoutFooter = new ConfirmNode({
        ...confirmModal,
        footer: false,
      });

      expect(nodeWithoutFooter.footer).toBe(false);
    });

    it('custom footer 옵션을 지원해야 함', () => {
      const customFooter = {
        confirm: 'Proceed',
        close: 'Cancel',
        hideConfirm: false,
        hideClose: false,
      };

      const nodeWithCustomFooter = new ConfirmNode({
        ...confirmModal,
        footer: customFooter,
      });

      expect(nodeWithCustomFooter.footer).toEqual(customFooter);
    });
  });
});
