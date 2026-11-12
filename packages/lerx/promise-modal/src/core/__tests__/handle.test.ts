import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ModalManager } from '../../app/ModalManager';
import { alertHandler } from '../handle/utils/alert';
import { confirmHandler } from '../handle/utils/confirm';
import { alert, confirm, prompt } from '../handle/utils/static';
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
  describe('alert', () => {
    it('alert()가 promise를 반환해야 함', () => {
      const result = alert({ title: 'Test Alert' });
      expect(result).toBeInstanceOf(Promise);
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
      modalNode?.onClose();

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

      modalNode?.onConfirm();

      const result = await promiseHandler;
      expect(result).toBe(true);
    });

    it('confirm이 false로 resolve되어야 함 (onClose)', async () => {
      const { modalNode, promiseHandler } = confirmHandler({ title: 'Test' });

      modalNode?.onClose();

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

      const calls = vi.mocked(ModalManager.open).mock.calls;
      calls.forEach((call) => {
        expect(call[0]).toHaveProperty('background');
        expect(call[0].background?.data).toEqual(backgroundData);
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

      const calls = vi.mocked(ModalManager.open).mock.calls;
      expect(calls[0][0].group).toBe('notifications');
      expect(calls[1][0].group).toBe('confirmations');
      expect(calls[2][0].group).toBe('forms');
    });
  });
  describe('error handling', () => {
    it('ModalManager.open이 실패해도 promise는 reject되어야 함', async () => {
      vi.mocked(ModalManager.open).mockImplementationOnce(() => {
        throw new Error('Failed to open modal');
      });

      await expect(async () => {
        await alert({ title: 'Test' });
      }).rejects.toThrow('Failed to open modal');
    });
  });
});
