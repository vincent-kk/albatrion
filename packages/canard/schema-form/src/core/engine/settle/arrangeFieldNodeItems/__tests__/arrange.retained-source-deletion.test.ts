import { expect, it } from 'vitest';

import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import {
  dispatchClear,
  dispatchMount,
  dispatchPop,
  dispatchPush,
  dispatchSetValue,
} from '../../../write';
import { getDispatchNode } from '../../__tests__/fixtures/getDispatchNode';
import { readFieldNodeInactiveValues } from '../../utils/detached/readFieldNodeInactiveValues';

it.each([
  ['on', 'pop'],
  ['off', 'pop'],
  ['verify', 'pop'],
  ['on', 'clear'],
  ['off', 'clear'],
  ['verify', 'clear'],
] as const)(
  '%s destroys %s sources and caller append replaces old-reference writes',
  (mode, operation) => {
    const { root, runtime } = createDispatchTree({
      type: 'array',
      items: { type: 'string' },
    });
    runtime.slots = mode;
    dispatchMount(root, ['old']);
    const old = getDispatchNode(root, '0');
    if (operation === 'pop') dispatchPop(root);
    else dispatchClear(root);
    const frozen = readFieldNodeInactiveValues(old);
    dispatchSetValue(old, 'detached write');
    expect(root.local).toEqual([]);
    dispatchPush(root, 'caller');
    expect(root.local).toEqual(['caller']);
    expect(readFieldNodeInactiveValues(root)).toEqual([]);
    expect(old.local).toBe('old');
    expect(readFieldNodeInactiveValues(old)).toBe(frozen);
  },
);

it.each(['on', 'off', 'verify'] as const)(
  '%s whole replacement prunes an unpublished write beneath a live array host',
  (mode) => {
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        list: { type: 'array', items: { type: 'string' } },
      },
    });
    runtime.slots = mode;
    dispatchMount(root, { list: ['old'] });
    const list = getDispatchNode(root, 'list');
    const old = getDispatchNode(list, '0');
    dispatchClear(list);
    dispatchSetValue(old, 'unpublished');
    dispatchSetValue(root, { list: [] });
    expect(readFieldNodeInactiveValues(root)).toEqual([]);
    dispatchPush(list, 'caller');
    expect(list.local).toEqual(['caller']);
    expect(old.local).toBe('old');
  },
);
