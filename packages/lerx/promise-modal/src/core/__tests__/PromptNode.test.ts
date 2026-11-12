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
  describe('initialization', () => {
    it('노드가 올바른 초기 상태를 가져야 함', () => {
      expect(node.alive).toBe(true);
      expect(node.visible).toBe(true);
      expect(node.type).toBe('prompt');
      expect(node.id).toBe(1);
      expect(node.initiator).toBe('test');
    });

    it('defaultValue로 초기화되어야 함', () => {
      expect(node.defaultValue).toBe('default');
    });

    it('defaultValue가 없으면 undefined여야 함', () => {
      const nodeWithoutDefault = new PromptNode({
        ...promptModal,
        defaultValue: undefined,
      });

      expect(nodeWithoutDefault.defaultValue).toBeUndefined();
    });

    it('Input 컴포넌트를 올바르게 초기화해야 함', () => {
      expect(node.Input).toBe(promptModal.Input);
    });
  });
  describe('onChange', () => {
    it('onChange가 리스너를 트리거하지 않음', () => {
      const listener = vi.fn();
      node.subscribe(listener);

      node.onChange('updated');
      expect(listener).not.toHaveBeenCalled();
    });

    it('여러 번 onChange를 호출할 수 있어야 함', () => {
      node.onChange('first');
      node.onChange('second');
      node.onChange('third');

      node.onConfirm();

      expect(handleResolve).toHaveBeenCalledWith('third');
    });

    it('복잡한 타입의 value를 처리할 수 있어야 함', () => {
      const complexHandleResolve = vi.fn();
      const complexModal = {
        id: 2,
        initiator: 'test',
        type: 'prompt' as const,
        Input: () => null,
        defaultValue: { name: 'John', age: 30 },
        handleResolve: complexHandleResolve,
      };

      const complexNode = new PromptNode(complexModal);

      complexNode.onConfirm();
      expect(complexHandleResolve).toHaveBeenCalledWith({
        name: 'John',
        age: 30,
      });

      complexHandleResolve.mockClear();
      const newNode = new PromptNode(complexModal);
      newNode.onChange({ name: 'Jane', age: 25 });
      newNode.onConfirm();
      expect(complexHandleResolve).toHaveBeenCalledWith({
        name: 'Jane',
        age: 25,
      });
    });
  });
  describe('onConfirm', () => {
    it('onConfirm()이 현재 value와 함께 handleResolve를 호출해야 함', () => {
      node.onChange('test value');
      node.onConfirm();

      expect(handleResolve).toHaveBeenCalledWith('test value');
      expect(handleResolve).toHaveBeenCalledTimes(1);
    });

    it('defaultValue 상태에서 onConfirm()을 호출해도 정상 동작해야 함', () => {
      node.onConfirm();
      expect(handleResolve).toHaveBeenCalledWith('default');
    });

    it('value가 undefined여도 onConfirm()이 동작해야 함', () => {
      const localHandleResolve = vi.fn();
      const nodeWithoutDefault = new PromptNode({
        id: 2,
        initiator: 'test',
        type: 'prompt',
        Input: () => null,
        defaultValue: undefined,
        handleResolve: localHandleResolve,
      });

      nodeWithoutDefault.onConfirm();
      expect(localHandleResolve).toHaveBeenCalledWith(undefined);
    });
  });
  describe('onClose', () => {
    it('returnOnCancel이 false면 onClose()가 null을 반환해야 함', () => {
      const localHandleResolve = vi.fn();
      const nodeWithoutReturn = new PromptNode({
        id: 10,
        initiator: 'test',
        type: 'prompt',
        Input: () => null,
        defaultValue: 'default',
        returnOnCancel: false,
        handleResolve: localHandleResolve,
      });

      nodeWithoutReturn.onClose();
      expect(localHandleResolve).toHaveBeenCalledWith(null);
    });

    it('returnOnCancel이 true면 onClose()가 현재 value를 반환해야 함', () => {
      const localHandleResolve = vi.fn();
      const nodeWithReturn = new PromptNode({
        id: 11,
        initiator: 'test',
        type: 'prompt',
        Input: () => null,
        defaultValue: 'default',
        returnOnCancel: true,
        handleResolve: localHandleResolve,
      });

      nodeWithReturn.onChange('changed value');
      nodeWithReturn.onClose();

      expect(localHandleResolve).toHaveBeenCalledWith('changed value');
    });

    it('returnOnCancel 기본값은 false여야 함', () => {
      node.onClose();
      expect(handleResolve).toHaveBeenCalledWith(null);
    });
  });
  describe('disabled', () => {
    it('disabled 함수가 없으면 undefined', () => {
      expect(node.disabled).toBeUndefined();
    });
  });
});
