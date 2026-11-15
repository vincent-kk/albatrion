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

it.each([['pop'], ['clear']] as const)(
  'destroys %s sources and caller append replaces old-reference writes',
  (operation) => {
    const { root } = createDispatchTree({
      type: 'array',
      items: { type: 'string' },
    });

    dispatchMount(root, ['old']);
    const old = getDispatchNode(root, '0');
    if (operation === 'pop') dispatchPop(root);
    else dispatchClear(root);
    const frozen = readFieldNodeInactiveValues(old);
    dispatchSetValue(old, 'detached write');
    expect(root.storedValue).toEqual([]);
    dispatchPush(root, 'caller');
    expect(root.storedValue).toEqual(['caller']);
    expect(readFieldNodeInactiveValues(root)).toEqual([]);
    expect(old.storedValue).toBe('old');
    expect(readFieldNodeInactiveValues(old)).toBe(frozen);
  },
);

it('whole replacement prunes an unpublished write beneath a live array host', () => {
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      list: { type: 'array', items: { type: 'string' } },
    },
  });

  dispatchMount(root, { list: ['old'] });
  const list = getDispatchNode(root, 'list');
  const old = getDispatchNode(list, '0');
  dispatchClear(list);
  dispatchSetValue(old, 'unpublished');
  dispatchSetValue(root, { list: [] });
  expect(readFieldNodeInactiveValues(root)).toEqual([]);
  dispatchPush(list, 'caller');
  expect(list.storedValue).toEqual(['caller']);
  expect(old.storedValue).toBe('old');
});
