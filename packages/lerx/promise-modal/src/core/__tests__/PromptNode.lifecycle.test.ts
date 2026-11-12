import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PromptNode } from '../node/ModalNode/PromptNode';

describe('PromptNode', () => {
  let promptModal: {
    id: number;
    initiator: string;
    type: 'prompt';
    title: string;
    content: string;
    Input: () => null;
    defaultValue: string;
    handleResolve: ReturnType<typeof vi.fn>;
  };
  let node: PromptNode<string, null>;
  let handleResolve: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    handleResolve = vi.fn();
    promptModal = {
      id: 1,
      initiator: 'test',
      type: 'prompt',
      title: 'Test Prompt',
      content: 'Enter value:',
      Input: () => null,
      defaultValue: 'default',
      handleResolve,
    };
    node = new PromptNode(promptModal);
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
  describe('error handling', () => {
    it('handleResolve가 없어도 에러가 발생하지 않아야 함', () => {
      const nodeWithoutResolve = new PromptNode({
        ...promptModal,
        handleResolve: undefined,
      });

      expect(() => nodeWithoutResolve.onConfirm()).not.toThrow();
      expect(() => nodeWithoutResolve.onClose()).not.toThrow();
    });
  });
  describe('footer options', () => {
    it('footer가 false이면 footer를 렌더링하지 않아야 함', () => {
      const nodeWithoutFooter = new PromptNode({
        ...promptModal,
        footer: false,
      });

      expect(nodeWithoutFooter.footer).toBe(false);
    });

    it('custom footer 옵션을 지원해야 함', () => {
      const customFooter = {
        confirm: 'Submit',
        cancel: 'Cancel',
        hideConfirm: false,
        hideCancel: false,
      };

      const nodeWithCustomFooter = new PromptNode({
        ...promptModal,
        footer: customFooter,
      });

      expect(nodeWithCustomFooter.footer).toEqual(customFooter);
    });
  });
});
