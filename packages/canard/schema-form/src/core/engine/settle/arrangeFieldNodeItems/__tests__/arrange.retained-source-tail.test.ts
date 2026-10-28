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

it('retains every candidate through an undeclared tail and old writes', () => {
  const item: BlueprintSchema = {
    type: 'object',
    allOf: [
      {
        controls: { active: '../../number' },
        properties: { v: { type: 'number', default: 37 } },
      },
      {
        controls: { active: '!../../number' },
        properties: { v: { type: 'string' } },
      },
    ],
  };
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      number: { type: 'boolean' },
      list: { type: 'array', prefixItems: [{ type: 'object' }, item] },
    },
  });

  dispatchMount(root, { number: false, list: [{}, { v: 'kept' }] });
  const list = getDispatchNode(root, 'list');
  dispatchSetValue(getDispatchNode(root, 'number'), true);
  const oldNumber = getDispatchNode(list, '1', 'v');
  dispatchSetValue(getDispatchNode(root, 'number'), false);
  dispatchInsert(list, 0, {});
  expect(list.local).toEqual([{}, {}, { v: 'kept' }]);
  expect(readFieldNodeInactiveValues(root)).toContainEqual({
    path: '/list/2/v',
    value: 37,
  });
  dispatchSetValue(oldNumber, 81);
  dispatchRemove(list, 0);
  expect(getDispatchNode(list, '1', 'v').local).toBe('kept');
  dispatchSetValue(getDispatchNode(root, 'number'), true);
  expect(getDispatchNode(list, '1', 'v').local).toBe(37);
  expect(oldNumber.local).toBe(37);
});
