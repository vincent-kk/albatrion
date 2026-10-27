import { expect, it } from 'vitest';

import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../../blueprint';
import {
  dispatchInsert,
  dispatchMount,
  dispatchRemove,
  dispatchSetValue,
} from '../../../write';
import { getDispatchNode } from '../../__tests__/fixtures/getDispatchNode';
import { readFieldNodeInactiveValues } from '../../utils/detached/readFieldNodeInactiveValues';

it.each([
  ['on', 'insert', 'items'],
  ['off', 'insert', 'items'],
  ['verify', 'insert', 'items'],
  ['on', 'remove', 'items'],
  ['off', 'remove', 'items'],
  ['verify', 'remove', 'items'],
  ['on', 'insert', 'tuple'],
  ['off', 'insert', 'tuple'],
  ['verify', 'insert', 'tuple'],
  ['on', 'remove', 'tuple'],
  ['off', 'remove', 'tuple'],
  ['verify', 'remove', 'tuple'],
] as const)(
  '%s preserves %s absent %s source slots and frozen hosts',
  (mode, operation, layout) => {
    const item: BlueprintSchema = {
      type: 'object',
      controls: { active: '../../show', unsetOnInactive: false },
      properties: {
        v: { type: 'string', controls: { unsetOnInactive: false } },
      },
    };
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        show: { type: 'boolean' },
        list:
          layout === 'items'
            ? { type: 'array', items: item }
            : { type: 'array', prefixItems: [item, item, item, item] },
      },
    });
    runtime.slots = mode;
    dispatchMount(root, {
      show: true,
      list: [{ v: 'first' }, { v: 'second' }, { v: 'third' }],
    });
    const list = getDispatchNode(root, 'list');
    const old = getDispatchNode(list, '1');
    dispatchSetValue(getDispatchNode(root, 'show'), false);
    const frozen = readFieldNodeInactiveValues(old);
    if (operation === 'insert') dispatchInsert(list, 0, { v: 'new' });
    else dispatchRemove(list, 0);
    expect(readFieldNodeInactiveValues(root)).toEqual(
      (operation === 'insert'
        ? ['new', 'first', 'second', 'third']
        : ['second', 'third']
      ).map((value, index) => ({ path: `/list/${index}/v`, value })),
    );
    expect(readFieldNodeInactiveValues(old)).toBe(frozen);
    dispatchSetValue(getDispatchNode(root, 'show'), true);
    expect(list.local).toEqual(
      (operation === 'insert'
        ? ['new', 'first', 'second', 'third']
        : ['second', 'third']
      ).map((v) => ({ v })),
    );
    expect(readFieldNodeInactiveValues(old)).toBe(frozen);
  },
);
