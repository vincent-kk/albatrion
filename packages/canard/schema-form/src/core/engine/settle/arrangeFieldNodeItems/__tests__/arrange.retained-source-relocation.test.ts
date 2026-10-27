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

it.each([['insert'], ['remove']] as const)(
  'preserves inactive tuple sources across %s and old-reference writes',
  (operation) => {
    const item: BlueprintSchema = {
      type: 'object',
      controls: { active: '../../show' },
      allOf: [
        {
          controls: { active: '../../numbers' },
          properties: { v: { type: 'number' } },
        },
        {
          controls: { active: '!../../numbers' },
          properties: { v: { type: 'string' } },
        },
      ],
    };
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        show: { type: 'boolean' },
        numbers: { type: 'boolean' },
        list: { type: 'array', prefixItems: [item, item, item, item] },
      },
    });

    dispatchMount(root, {
      show: true,
      numbers: true,
      list: [{ v: 11 }, { v: 22 }],
    });
    const list = getDispatchNode(root, 'list');
    const index = operation === 'insert' ? 0 : 1;
    const destination = operation === 'insert' ? 1 : 0;
    const old = getDispatchNode(getDispatchNode(list, String(index)), 'v');
    dispatchSetValue(getDispatchNode(root, 'show'), false);
    const frozen = readFieldNodeInactiveValues(old);
    if (operation === 'insert') dispatchInsert(list, 0, {});
    else dispatchRemove(list, 0);
    expect(readFieldNodeInactiveValues(root)).toContainEqual({
      path: `/list/${destination}/v`,
      value: index ? 22 : 11,
    });
    dispatchSetValue(old, 33);
    dispatchSetValue(getDispatchNode(root, 'show'), true);
    expect(
      getDispatchNode(getDispatchNode(list, String(destination)), 'v').local,
    ).toBe(33);
    expect(old.local).toBe(index ? 22 : 11);
    expect(readFieldNodeInactiveValues(old)).toBe(frozen);
  },
);
