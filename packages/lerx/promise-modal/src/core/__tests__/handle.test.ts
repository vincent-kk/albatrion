import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ModalManager } from '../../app/ModalManager';
import { alertHandler } from '../handle/alert';
import { confirmHandler } from '../handle/confirm';
import { promptHandler } from '../handle/prompt';
import { alert, confirm, prompt } from '../handle/static';

// ModalManager를 모킹
vi.mock('../../app/ModalManager', () => {
  const modalNodes = new Map();
  let idCounter = 0;

  return {
    ModalManager: {
      open: vi.fn((modal) => {
        const id = ++idCounter;
        const mockNode = {
          id,
          alive: true,
          visible: false,
          handleResolve: undefined,
          onConfirm: vi.fn(),
          onClose: vi.fn(),
          onDestroy: vi.fn(),
          onShow: vi.fn(),
          onHide: vi.fn(),
          subscribe: vi.fn(() => () => {}),
          ...modal,
        };
        modalNodes.set(id, mockNode);
        return mockNode;
      }),
      reset: vi.fn(() => {
        modalNodes.clear();
        idCounter = 0;
      }),
    },
  };
});

describe('Modal Handlers', () => {
  beforeEach(() => {
    ModalManager.reset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('alert', () => {
    it('alert()가 promise를 반환해야 함', () => {
      const result = alert({ title: 'Test Alert' });
      expect(result).toBeInstanceOf(Promise);
    });

    it('alertHandler()가 modalNode와 promiseHandler를 반환해야 함', () => {
      const result = alertHandler({ title: 'Test Alert' });

      expect(result).toHaveProperty('modalNode');
      expect(result).toHaveProperty('promiseHandler');
      expect(result.promiseHandler).toBeInstanceOf(Promise);
    });

    it('alert()가 ModalManager.open을 호출해야 함', () => {
      alert({ title: 'Test Alert', content: 'Test Content' });

      expect(ModalManager.open).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'alert',
          title: 'Test Alert',
          content: 'Test Content',
        }),
      );
    });

    it('alert promise가 void로 resolve되어야 함', async () => {
      const { modalNode, promiseHandler } = alertHandler({ title: 'Test' });

      // handleResolve를 호출하여 promise resolve
      setTimeout(() => {
        if (modalNode.handleResolve) {
          modalNode.handleResolve(null);
        }
      }, 0);

      const result = await promiseHandler;
      expect(result).toBeUndefined();
    });

    it('alert에 모든 옵션을 전달할 수 있어야 함', () => {
      alert({
        title: 'Alert',
        subtitle: 'Subtitle',
        content: 'Content',
        subtype: 'error',
        footer: false,
        dimmed: false,
        duration: 500,
        manualDestroy: true,
        closeOnBackdropClick: false,
      });

      expect(ModalManager.open).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'alert',
          subtype: 'error',
          footer: false,
          dimmed: false,
          duration: 500,
          manualDestroy: true,
          closeOnBackdropClick: false,
        }),
      );
    });
  });

  describe('confirm', () => {
    it('confirm()이 promise를 반환해야 함', () => {
      const result = confirm({ title: 'Test Confirm' });
      expect(result).toBeInstanceOf(Promise);
    });

    it('confirmHandler()가 modalNode와 promiseHandler를 반환해야 함', () => {
      const result = confirmHandler({ title: 'Test Confirm' });

      expect(result).toHaveProperty('modalNode');
      expect(result).toHaveProperty('promiseHandler');
      expect(result.promiseHandler).toBeInstanceOf(Promise);
    });

    it('confirm()이 ModalManager.open을 호출해야 함', () => {
      confirm({ title: 'Test Confirm', content: 'Are you sure?' });

      expect(ModalManager.open).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'confirm',
          title: 'Test Confirm',
          content: 'Are you sure?',
        }),
      );
    });

    it('confirm이 true로 resolve되어야 함 (onConfirm)', async () => {
      const { modalNode, promiseHandler } = confirmHandler({ title: 'Test' });

      setTimeout(() => {
        if (modalNode.handleResolve) {
          modalNode.handleResolve(true);
        }
      }, 0);

      const result = await promiseHandler;
      expect(result).toBe(true);
    });

    it('confirm이 false로 resolve되어야 함 (onClose)', async () => {
      const { modalNode, promiseHandler } = confirmHandler({ title: 'Test' });

      setTimeout(() => {
        if (modalNode.handleResolve) {
          modalNode.handleResolve(false);
        }
      }, 0);

      const result = await promiseHandler;
      expect(result).toBe(false);
    });

    it('confirm에 footer 옵션을 전달할 수 있어야 함', () => {
      confirm({
        title: 'Confirm',
        footer: {
          confirm: 'Yes',
          cancel: 'No',
          hideConfirm: false,
          hideCancel: false,
        },
      });

      expect(ModalManager.open).toHaveBeenCalledWith(
        expect.objectContaining({
          footer: {
            confirm: 'Yes',
            cancel: 'No',
            hideConfirm: false,
            hideCancel: false,
          },
        }),
      );
    });
  });

  describe('prompt', () => {
    const mockInput = vi.fn(() => null);

    it('prompt()가 promise를 반환해야 함', () => {
      const result = prompt({ title: 'Test Prompt', Input: mockInput });
      expect(result).toBeInstanceOf(Promise);
    });

    it('promptHandler()가 modalNode와 promiseHandler를 반환해야 함', () => {
      const result = promptHandler({ title: 'Test Prompt', Input: mockInput });

      expect(result).toHaveProperty('modalNode');
      expect(result).toHaveProperty('promiseHandler');
      expect(result.promiseHandler).toBeInstanceOf(Promise);
    });

    it('prompt()가 ModalManager.open을 호출해야 함', () => {
      prompt({
        title: 'Test Prompt',
        content: 'Enter value:',
        Input: mockInput,
      });

      expect(ModalManager.open).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'prompt',
          title: 'Test Prompt',
          content: 'Enter value:',
          Input: mockInput,
        }),
      );
    });

    it('prompt가 입력값으로 resolve되어야 함', async () => {
      const { modalNode, promiseHandler } = promptHandler({
        title: 'Test',
        Input: mockInput,
      });

      setTimeout(() => {
        if (modalNode.handleResolve) {
          modalNode.handleResolve('user input');
        }
      }, 0);

      const result = await promiseHandler;
      expect(result).toBe('user input');
    });

    it('prompt에 defaultValue를 전달할 수 있어야 함', () => {
      prompt({
        title: 'Prompt',
        Input: mockInput,
        defaultValue: 'default text',
      });

      expect(ModalManager.open).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultValue: 'default text',
        }),
      );
    });

    it('prompt에 disabled 함수를 전달할 수 있어야 함', () => {
      const disabledFn = vi.fn((value) => !value || value.length < 3);

      prompt({
        title: 'Prompt',
        Input: mockInput,
        disabled: disabledFn,
      });

      expect(ModalManager.open).toHaveBeenCalledWith(
        expect.objectContaining({
          disabled: disabledFn,
        }),
      );
    });

    it('prompt에 returnOnCancel을 전달할 수 있어야 함', () => {
      prompt({
        title: 'Prompt',
        Input: mockInput,
        returnOnCancel: true,
      });

      expect(ModalManager.open).toHaveBeenCalledWith(
        expect.objectContaining({
          returnOnCancel: true,
        }),
      );
    });

    it('prompt가 null로 resolve될 수 있어야 함 (cancel without returnOnCancel)', async () => {
      const { modalNode, promiseHandler } = promptHandler({
        title: 'Test',
        Input: mockInput,
        returnOnCancel: false,
      });

      setTimeout(() => {
        if (modalNode.handleResolve) {
          modalNode.handleResolve(null);
        }
      }, 0);

      const result = await promiseHandler;
      expect(result).toBeNull();
    });

    it('prompt가 복잡한 타입을 지원해야 함', async () => {
      interface UserData {
        name: string;
        email: string;
      }

      const userData: UserData = { name: 'John', email: 'john@example.com' };

      const { modalNode, promiseHandler } = promptHandler<UserData>({
        title: 'Test',
        Input: mockInput,
        defaultValue: userData,
      });

      setTimeout(() => {
        if (modalNode.handleResolve) {
          modalNode.handleResolve(userData);
        }
      }, 0);

      const result = await promiseHandler;
      expect(result).toEqual(userData);
    });
  });

  describe('background data', () => {
    it('모든 모달 타입에 background를 전달할 수 있어야 함', () => {
      const backgroundData = { color: 'blue', animated: true };

      alert({ title: 'Alert', background: { data: backgroundData } });
      confirm({ title: 'Confirm', background: { data: backgroundData } });
      prompt({
        title: 'Prompt',
        Input: vi.fn(),
        background: { data: backgroundData },
      });

      expect(ModalManager.open).toHaveBeenCalledTimes(3);

      const calls = (ModalManager.open as any).mock.calls;
      calls.forEach((call: any) => {
        expect(call[0]).toHaveProperty('background');
        expect(call[0].background.data).toEqual(backgroundData);
      });
    });
  });

  describe('group', () => {
    it('모달에 group을 지정할 수 있어야 함', () => {
      alert({ title: 'Alert', group: 'notifications' });
      confirm({ title: 'Confirm', group: 'confirmations' });
      prompt({
        title: 'Prompt',
        Input: vi.fn(),
        group: 'forms',
      });

      const calls = (ModalManager.open as any).mock.calls;
      expect(calls[0][0].group).toBe('notifications');
      expect(calls[1][0].group).toBe('confirmations');
      expect(calls[2][0].group).toBe('forms');
    });
  });

  describe('error handling', () => {
    it('ModalManager.open이 실패해도 promise는 reject되어야 함', async () => {
      (ModalManager.open as any).mockImplementationOnce(() => {
        throw new Error('Failed to open modal');
      });

      await expect(async () => {
        await alert({ title: 'Test' });
      }).rejects.toThrow('Failed to open modal');
    });
  });
});
