import { expect, it, vi } from 'vitest';

import {
  dispatchBatch,
  dispatchMount,
  dispatchSetExternalErrors,
  dispatchSetState,
  dispatchSetValue,
  subscribeFieldNode,
} from '../../write';
import { createSlotVerifyPair } from './fixtures/createSlotVerifyPair';
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
  const { root } = createSlotVerifyPair(SCHEMA, 'verify');
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
  expect(root.runtime.slotVerification).toEqual({ commits: 2, differences: 0 });
});

it('replays resolved inputs without invoking a public updater twice', () => {
  const { root } = createSlotVerifyPair(SCHEMA, 'verify');
  dispatchMount(root, { open: true, count: 0, value: 'held' });
  const updater = vi.fn((value: unknown) => !value);
  dispatchSetValue(getDispatchNode(root, 'open'), updater);
  expect(updater).toHaveBeenCalledTimes(1);
  expect(root.runtime.slotVerification).toEqual({ commits: 2, differences: 0 });
});

it('replays the resolved batch without invoking its callback again', () => {
  const { root } = createSlotVerifyPair(SCHEMA, 'verify');
  dispatchMount(root, { open: true, count: 0, value: 'held' });
  const callback = vi.fn(() => {
    dispatchSetValue(getDispatchNode(root, 'open'), false);
    dispatchSetValue(getDispatchNode(root, 'count'), 3);
  });
  dispatchBatch(root, callback);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(root.local).toEqual({ open: false, count: 3 });
  expect(root.runtime.slotVerification).toEqual({ commits: 2, differences: 0 });
});

it('compares frozen detached reads after external state and error inputs', () => {
  const { root } = createSlotVerifyPair(SCHEMA, 'verify');
  dispatchMount(root, { open: true, count: 0, value: 'held' });
  const old = getDispatchNode(root, 'value');
  dispatchSetState(old, { dirty: true, touched: true });
  dispatchSetExternalErrors(old, [{ dataPath: '/value', message: 'external' }]);
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  dispatchSetValue(getDispatchNode(root, 'open'), true);
  expect(old.detached).toBe(true);
  expect(root.runtime.slotVerification?.differences).toBe(0);
});
