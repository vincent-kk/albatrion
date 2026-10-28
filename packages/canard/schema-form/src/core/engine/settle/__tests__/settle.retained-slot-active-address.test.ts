import { afterEach, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchSetValue } from '../../write';
import { readFieldNodeInactiveValues } from '../utils/detached/readFieldNodeInactiveValues';
import { getDispatchNode } from './fixtures/getDispatchNode';

afterEach(() => vi.restoreAllMocks());

it('keeps fresh clone memos empty and ignores writes through old lifetimes', () => {
  // Fresh lifetimes retain no per-reference write state.
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      value: { type: 'string', controls: { active: '../open' } },
    },
  });
  dispatchMount(root, { open: true, value: 'held' });
  const first = getDispatchNode(root, 'value');
  dispatchSetValue(getDispatchNode(root, 'open'), false);

  dispatchSetValue(getDispatchNode(root, 'open'), true);
  const second = getDispatchNode(root, 'value');
  expect(second).not.toBe(first);
  expect(
    ['inactiveValueMemo', 'inactiveValuesCache', 'inactiveValuesDirty'].filter(
      (key) => Object.prototype.hasOwnProperty.call(second, key),
    ),
  ).toEqual([]);

  dispatchSetValue(getDispatchNode(root, 'open'), false);
  dispatchSetValue(first, 'patched');
  dispatchSetValue(getDispatchNode(root, 'open'), true);
  expect(getDispatchNode(root, 'value').raw).toBe('held');
  expect(first.raw).toBe('held');
});

it('does not copy empty aggregate caches onto an active leaf clone', () => {
  // Empty optional records are part of the shipping clone allocation bound.
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      value: { type: 'string', controls: { active: '../open' } },
    },
  });
  dispatchMount(root, { open: true, value: 'held' });
  const first = getDispatchNode(root, 'value');
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  expect(readFieldNodeInactiveValues(root)).toEqual([
    { path: '/value', value: 'held' },
  ]);
  const frozen = readFieldNodeInactiveValues(first);
  dispatchSetValue(getDispatchNode(root, 'open'), true);
  const second = getDispatchNode(root, 'value');
  expect(
    ['inactiveValuesCache', 'inactiveValuesDirty'].filter((key) =>
      Object.prototype.hasOwnProperty.call(second, key),
    ),
  ).toEqual([]);
  expect(second.inactiveValueMemo).toBeUndefined();
  expect(readFieldNodeInactiveValues(second)).toEqual([]);
  expect(readFieldNodeInactiveValues(first)).toBe(frozen);
});
