import { afterEach, expect, it, vi } from 'vitest';

import { nodeFactory } from '@/promise-modal/core';

import { ModalManager } from '../ModalManager';

afterEach(() => ModalManager.reset());
it('keeps the id snapshot stable through publication and resets order only when empty', () => {
  const first = nodeFactory({
    type: 'alert',
    id: ModalManager.nextId(),
    initiator: '/',
  });
  const second = nodeFactory({
    type: 'alert',
    id: ModalManager.nextId(),
    initiator: '/',
  });
  ModalManager.register(first);
  const ids = ModalManager.ids;
  first.onHide();
  expect(ModalManager.ids).toBe(ids);
  ModalManager.register(second);
  expect(ModalManager.ids).not.toBe(ids);
  expect(second.order).toBeGreaterThan(first.order);
  ModalManager.raise(first.id);
  expect(first.order).toBeGreaterThan(second.order);
  const listener = vi.fn();
  first.subscribe(listener);
  ModalManager.raise(first.id);
  expect(listener).not.toHaveBeenCalled();
  first.onDestroy();
  second.onDestroy();
  const third = nodeFactory({
    type: 'alert',
    id: ModalManager.nextId(),
    initiator: '/',
  });
  ModalManager.register(third);
  expect(third.id).toBe(2);
  expect(third.order).toBe(1);
});
it('forwards errors from queue entries without dispatchers and continues the queue', () => {
  const reject = vi.fn();
  const resolve = vi.fn();
  const error = new Error('queue failure');
  ModalManager.open({ type: 'alert', title: 'bad', handleReject: reject });
  ModalManager.open({ type: 'alert', title: 'good', handleResolve: resolve });
  ModalManager.openHandler = (modal) => {
    if (modal.title === 'bad') throw error;
    const node = nodeFactory({
      ...modal,
      id: ModalManager.nextId(),
      initiator: '/',
    });
    node.onConfirm();
    return node;
  };
  expect(reject).toHaveBeenCalledExactlyOnceWith(error);
  expect(resolve).toHaveBeenCalledExactlyOnceWith(null);
});
it('reset removes DOM, detaches node listeners and resets ids', () => {
  const node = nodeFactory({
    type: 'alert',
    id: ModalManager.nextId(),
    initiator: '/',
  });
  ModalManager.register(node);
  const anchor = ModalManager.anchor();
  const listener = vi.fn();
  ModalManager.subscribe(listener);
  ModalManager.reset();
  listener.mockClear();
  node.onHide();
  expect(anchor.isConnected).toBe(false);
  expect(listener).not.toHaveBeenCalled();
  expect(ModalManager.ids).toEqual([]);
  expect(ModalManager.nextId()).toBe(0);
});
