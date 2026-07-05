import { afterEach, describe, expect, it } from 'vitest';

import type { ModalNode } from '@/promise-modal/core';
import {
  alertHandler,
  confirmHandler,
  nodeFactory,
  promptHandler,
} from '@/promise-modal/core';
import type { Modal } from '@/promise-modal/types';

import { ModalManager } from '../ModalManager';

const PENDING = Symbol('pending');

const settleState = (promise: Promise<unknown>) =>
  Promise.race([
    promise.then(
      () => 'settled',
      () => 'rejected',
    ),
    Promise.resolve(PENDING),
  ]);

const installOpenHandler = () => {
  const created: ModalNode[] = [];
  let sequence = 0;
  ModalManager.openHandler = (modal: Modal) => {
    const modalNode = nodeFactory({
      duration: 0,
      manualDestroy: false,
      closeOnBackdropClick: true,
      ...modal,
      id: sequence++,
      initiator: '/prerender-flow',
    });
    created.push(modalNode);
    return modalNode;
  };
  return created;
};

describe('prerender flow (real ModalManager, no mocking)', () => {
  afterEach(() => {
    ModalManager.reset();
  });

  it('마운트 전 호출: modalNode는 undefined지만 promise는 pending으로 유지되어야 함', async () => {
    const { modalNode, promiseHandler } = alertHandler({ title: 'pre-mount' });

    expect(modalNode).toBeUndefined();
    expect(ModalManager.prerender.length).toBe(1);
    await expect(settleState(promiseHandler)).resolves.toBe(PENDING);
  });

  it('openHandler 설정 시 큐가 flush되고, 이후 상호작용이 원래 promise를 resolve해야 함 (alert)', async () => {
    const { promiseHandler } = alertHandler({ title: 'queued-alert' });

    const created = installOpenHandler();
    expect(ModalManager.prerender.length).toBe(0);
    expect(created.length).toBe(1);

    created[0].onConfirm();
    await expect(promiseHandler).resolves.toBeUndefined();
  });

  it('flush된 confirm 노드의 onClose는 false로 resolve해야 함', async () => {
    const { promiseHandler } = confirmHandler({ title: 'queued-confirm' });

    const created = installOpenHandler();
    created[0].onClose();

    await expect(promiseHandler).resolves.toBe(false);
  });

  it('flush된 prompt 노드는 onChange 후 onConfirm 시 입력값으로 resolve해야 함', async () => {
    const { promiseHandler } = promptHandler<string>({
      title: 'queued-prompt',
      Input: () => null,
    });

    const created = installOpenHandler();
    const promptNode = created[0];
    if (promptNode.type !== 'prompt') throw new Error('unexpected node type');
    promptNode.onChange('typed');
    promptNode.onConfirm();

    await expect(promiseHandler).resolves.toBe('typed');
  });

  it('prompt 취소는 null로 resolve해야 함 (returnOnCancel 미설정)', async () => {
    installOpenHandler();
    const { modalNode, promiseHandler } = promptHandler<string>({
      title: 'cancel-null',
      Input: () => null,
      defaultValue: 'initial',
    });

    modalNode?.onClose();
    await expect(promiseHandler).resolves.toBe(null);
  });

  it('returnOnCancel: true면 취소 시점의 현재 입력값으로 resolve해야 함', async () => {
    installOpenHandler();
    const { modalNode, promiseHandler } = promptHandler<string>({
      title: 'cancel-current',
      Input: () => null,
      defaultValue: 'initial',
      returnOnCancel: true,
    });

    modalNode?.onChange('typed-by-user');
    modalNode?.onClose();
    await expect(promiseHandler).resolves.toBe('typed-by-user');
  });

  it('마운트 전 abort: 큐에서 제거되고 cancel 값으로 resolve되어야 함', async () => {
    const controller = new AbortController();
    const { promiseHandler } = confirmHandler({
      title: 'pre-mount-abort',
      signal: controller.signal,
    });
    expect(ModalManager.prerender.length).toBe(1);

    controller.abort();
    expect(ModalManager.prerender.length).toBe(0);
    await expect(promiseHandler).resolves.toBe(false);

    const created = installOpenHandler();
    expect(created.length).toBe(0);
  });

  it('마운트 후 abort: closeModal 경로로 cancel 값이 resolve되어야 함', async () => {
    installOpenHandler();
    const controller = new AbortController();
    const { modalNode, promiseHandler } = confirmHandler({
      title: 'post-mount-abort',
      signal: controller.signal,
    });
    expect(modalNode).toBeDefined();

    controller.abort();
    await expect(promiseHandler).resolves.toBe(false);
  });

  it('이미 aborted된 signal로 호출하면 모달을 만들지 않고 즉시 cancel 값으로 resolve해야 함', async () => {
    const created = installOpenHandler();
    const controller = new AbortController();
    controller.abort();

    const { modalNode, promiseHandler } = promptHandler<string>({
      title: 'aborted-before-open',
      Input: () => null,
      defaultValue: 'initial',
      returnOnCancel: true,
      signal: controller.signal,
    });

    expect(modalNode).toBeUndefined();
    expect(created.length).toBe(0);
    await expect(promiseHandler).resolves.toBe('initial');
  });

  it('flush 중 openHandler가 throw하면 해당 promise만 reject되고 나머지 큐는 계속 flush되어야 함', async () => {
    const first = alertHandler({ title: 'flush-throw-target' });
    const second = confirmHandler({ title: 'flush-survivor' });
    expect(ModalManager.prerender.length).toBe(2);

    const created: ModalNode[] = [];
    let sequence = 0;
    ModalManager.openHandler = (modal: Modal) => {
      if (modal.title === 'flush-throw-target')
        throw new Error('flush failure');
      const modalNode = nodeFactory({
        duration: 0,
        manualDestroy: false,
        closeOnBackdropClick: true,
        ...modal,
        id: sequence++,
        initiator: '/flush-throw',
      });
      created.push(modalNode);
      return modalNode;
    };

    await expect(first.promiseHandler).rejects.toThrow('flush failure');
    expect(created.length).toBe(1);

    created[0].onClose();
    await expect(second.promiseHandler).resolves.toBe(false);
  });

  it('openHandler가 throw하면 promise는 reject되어야 함', async () => {
    ModalManager.openHandler = () => {
      throw new Error('Failed to open modal');
    };

    await expect(
      alertHandler({ title: 'throwing' }).promiseHandler,
    ).rejects.toThrow('Failed to open modal');
  });

  it('마운트 전 결과의 modalNode getter는 flush 후 생성된 노드를 반환해야 함', () => {
    const handled = alertHandler({ title: 'live-getter' });
    expect(handled.modalNode).toBeUndefined();

    const created = installOpenHandler();
    expect(handled.modalNode).toBe(created[0]);
  });

  it('reset() 후에는 다시 prerender 큐잉 모드로 돌아가야 함', () => {
    installOpenHandler();
    ModalManager.reset();

    const { modalNode } = alertHandler({ title: 'after-reset' });
    expect(modalNode).toBeUndefined();
    expect(ModalManager.prerender.length).toBe(1);
  });
});
