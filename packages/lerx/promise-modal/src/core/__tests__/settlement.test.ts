import { expect, it, vi } from 'vitest';

import { nodeFactory } from '../node/nodeFactory';

it('R15 destroys an unsettled node by cancelling once and publishing its removal', () => {
  const resolve = vi.fn();
  const listener = vi.fn();
  const node = nodeFactory({
    type: 'confirm',
    id: 1,
    initiator: '/',
    handleResolve: resolve,
  });
  node.subscribe(listener);
  node.onDestroy();
  node.onDestroy();
  expect(resolve).toHaveBeenCalledExactlyOnceWith(false);
  expect(node.settled).toBe(true);
  expect(node.visible).toBe(false);
  expect(node.alive).toBe(false);
  expect(listener).toHaveBeenCalled();
});
it('rejects only once and never shows a settled or dead node', () => {
  const reject = vi.fn();
  const resolve = vi.fn();
  const error = new Error('render');
  const node = nodeFactory({
    type: 'confirm',
    id: 1,
    initiator: '/',
    handleResolve: resolve,
    handleReject: reject,
  });
  node.onReject(error);
  node.onConfirm();
  node.onHide();
  node.onShow();
  node.onDestroy();
  expect(reject).toHaveBeenCalledExactlyOnceWith(error);
  expect(resolve).not.toHaveBeenCalled();
  expect(node.visible).toBe(false);
});
it('preserves prompt subtype, group and current value independently of defaultValue', () => {
  const node = nodeFactory({
    type: 'prompt',
    id: 1,
    initiator: '/',
    subtype: 'warning',
    group: 'form',
    defaultValue: 'a',
    Input: () => null,
  });
  if (node.type !== 'prompt') throw new Error('expected prompt');
  node.onChange('b');
  expect(node.value).toBe('b');
  expect(node.defaultValue).toBe('a');
  expect(node.subtype).toBe('warning');
  expect(node.group).toBe('form');
});
