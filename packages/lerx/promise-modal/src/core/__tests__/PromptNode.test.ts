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
      expect(node.visible).toBe(true); // AbstractNode 초기 상태는 visible=true
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
    it('onChange로 value를 변경할 수 있어야 함', () => {
      // onChange는 내부 value를 변경하지만 외부에서 직접 접근할 수 없음
      // onConfirm을 통해 변경된 값이 전달되는지 확인
      node.onChange('new value');
      node.onConfirm();
      expect(handleResolve).toHaveBeenCalledWith('new value');
    });

    it('onChange가 리스너를 트리거하지 않음', () => {
      // onChange는 publish()를 호출하지 않음
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
      // 마지막 onChange 값이 사용됨
      expect(handleResolve).toHaveBeenCalledWith('third');
    });

    it('복잡한 타입의 value를 처리할 수 있어야 함', () => {
      interface UserData {
        name: string;
        age: number;
      }

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

      // defaultValue 확인
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
      // undefined ?? null = null
      expect(localHandleResolve).toHaveBeenCalledWith(null);
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

    it('disabled 함수가 value를 받아 disabled 상태를 결정해야 함', () => {
      const nodeWithDisabled = new PromptNode({
        ...promptModal,
        disabled: (value) => !value || value.length < 3,
      });

      // disabled 함수가 존재하는지 확인
      expect(nodeWithDisabled.disabled).toBeDefined();
      expect(typeof nodeWithDisabled.disabled).toBe('function');

      // 초기 상태 (defaultValue = 'default', length >= 3)
      expect(nodeWithDisabled.disabled?.('default')).toBe(false);

      // 짧은 값
      expect(nodeWithDisabled.disabled?.('ab')).toBe(true);

      // 충분한 길이
      expect(nodeWithDisabled.disabled?.('abc')).toBe(false);

      // 빈 값
      expect(nodeWithDisabled.disabled?.('')).toBe(true);
    });

    it('disabled 함수가 복잡한 검증을 수행할 수 있어야 함', () => {
      interface FormData {
        email: string;
        age: number;
      }

      const formModal = {
        id: 3,
        initiator: 'test',
        type: 'prompt' as const,
        Input: () => null,
        defaultValue: { email: '', age: 0 },
        disabled: (value: FormData | undefined) => {
          if (!value) return true;
          const emailValid = value.email.includes('@');
          const ageValid = value.age >= 18;
          return !emailValid || !ageValid;
        },
        handleResolve: vi.fn(),
      };

      const formNode = new PromptNode(formModal);

      // 초기 상태 (invalid)
      expect(formNode.disabled?.({ email: '', age: 0 })).toBe(true);

      // 유효한 이메일만
      expect(formNode.disabled?.({ email: 'test@example.com', age: 0 })).toBe(
        true,
      );

      // 유효한 나이만
      expect(formNode.disabled?.({ email: 'invalid', age: 20 })).toBe(true);

      // 모두 유효
      expect(formNode.disabled?.({ email: 'test@example.com', age: 20 })).toBe(
        false,
      );
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

  describe('error handling', () => {
    it('handleResolve가 없어도 에러가 발생하지 않아야 함', () => {
      const nodeWithoutResolve = new PromptNode({
        ...promptModal,
        handleResolve: undefined,
      });

      expect(() => nodeWithoutResolve.onConfirm()).not.toThrow();
      expect(() => nodeWithoutResolve.onClose()).not.toThrow();
    });

    it('disabled 함수에서 에러가 발생해도 처리되어야 함', () => {
      const nodeWithBrokenDisabled = new PromptNode({
        ...promptModal,
        disabled: (_value) => {
          throw new Error('Validation error');
        },
      });

      // disabled 함수를 직접 호출하면 에러가 발생
      expect(() => nodeWithBrokenDisabled.disabled?.('test')).toThrow(
        'Validation error',
      );
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
        close: 'Cancel',
        hideConfirm: false,
        hideClose: false,
      };

      const nodeWithCustomFooter = new PromptNode({
        ...promptModal,
        footer: customFooter,
      });

      expect(nodeWithCustomFooter.footer).toEqual(customFooter);
    });
  });
});
