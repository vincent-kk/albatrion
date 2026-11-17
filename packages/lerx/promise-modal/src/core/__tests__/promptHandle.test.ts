import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ModalManager } from '../../app/ModalManager';
import { promptHandler } from '../handle/utils/prompt';
import { prompt } from '../handle/utils/static';
import { nodeFactory } from '../node/nodeFactory';

describe('Modal Handlers', () => {
  beforeEach(() => {
    ModalManager.reset();
    vi.spyOn(ModalManager, 'open').mockImplementation((modal) =>
      nodeFactory({
        ...modal,
        id: ModalManager.nextId(),
        initiator: '/handlers',
      }),
    );
  });
  afterEach(() => {
    ModalManager.reset();
    vi.restoreAllMocks();
  });
  describe('prompt', () => {
    const mockInput = vi.fn(() => null);

    it('prompt()가 promise를 반환해야 함', () => {
      const result = prompt({ title: 'Test Prompt', Input: mockInput });
      expect(result).toBeInstanceOf(Promise);
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

      modalNode?.onChange('user input');
      modalNode?.onConfirm();

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

      modalNode?.onClose();

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

      modalNode?.onConfirm();

      const result = await promiseHandler;
      expect(result).toEqual(userData);
    });
  });
});
