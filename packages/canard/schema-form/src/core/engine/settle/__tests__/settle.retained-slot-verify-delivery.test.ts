import { expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import {
  dispatchBatch,
  dispatchMount,
  dispatchSetExternalErrors,
  dispatchSetState,
  dispatchSetValue,
  subscribeFieldNode,
} from '../../write';
import { getDispatchNode } from './fixtures/getDispatchNode';

/** Two independent source writes make callback and batch duplication visible. */
const SCHEMA = {
  type: 'object',
  properties: {
    open: { type: 'boolean' },
    count: { type: 'number' },
    value: { type: 'string', controls: { active: '../open' } },
  },
} as const;

it('checks payloads with subscribers while invoking public callbacks only once', () => {
  const { root } = createDispatchTree(SCHEMA);
  const onChange = vi.fn();
  const listener = vi.fn();
  root.runtime.onChange = onChange;
  subscribeFieldNode(root, listener);
  dispatchMount(root, { open: true, count: 0, value: 'held' });
  onChange.mockClear();
  listener.mockClear();
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledTimes(1);
});

it('replays resolved inputs without invoking a public updater twice', () => {
  const { root } = createDispatchTree(SCHEMA);
  dispatchMount(root, { open: true, count: 0, value: 'held' });
  const updater = vi.fn((value: unknown) => !value);
  dispatchSetValue(getDispatchNode(root, 'open'), updater);
  expect(updater).toHaveBeenCalledTimes(1);
});

it('replays the resolved batch without invoking its callback again', () => {
  const { root } = createDispatchTree(SCHEMA);
  dispatchMount(root, { open: true, count: 0, value: 'held' });
  const callback = vi.fn(() => {
    dispatchSetValue(getDispatchNode(root, 'open'), false);
    dispatchSetValue(getDispatchNode(root, 'count'), 3);
  });
  dispatchBatch(root, callback);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(root.local).toEqual({ open: false, count: 3 });
});

it('compares frozen detached reads after external state and error inputs', () => {
  const { root } = createDispatchTree(SCHEMA);
  dispatchMount(root, { open: true, count: 0, value: 'held' });
  const old = getDispatchNode(root, 'value');
  dispatchSetState(old, { edited: true, touched: true });
  dispatchSetExternalErrors(old, [{ dataPath: '/value', message: 'external' }]);
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  dispatchSetValue(getDispatchNode(root, 'open'), true);
  expect(old.detached).toBe(true);
});
