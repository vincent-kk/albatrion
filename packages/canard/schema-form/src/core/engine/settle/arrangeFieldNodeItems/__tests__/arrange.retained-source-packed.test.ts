import { expect, it } from 'vitest';

import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../../blueprint';
import {
  dispatchInsert,
  dispatchMount,
  dispatchSetValue,
} from '../../../write';
import { getDispatchNode } from '../../__tests__/fixtures/getDispatchNode';
import { readFieldNodeInactiveValues } from '../../utils/detached/readFieldNodeInactiveValues';

it('moves packed inactive arrays without publishing their internal leaves', () => {
  const item: BlueprintSchema = {
    type: 'array',
    controls: { active: '../../show' },
    items: { type: 'string' },
  };
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      show: { type: 'boolean' },
      list: { type: 'array', prefixItems: [item, item, item] },
    },
  });

  dispatchMount(root, { show: true, list: [['one', 'two'], ['three']] });
  const list = getDispatchNode(root, 'list');
  dispatchSetValue(getDispatchNode(root, 'show'), false);
  const previous = readFieldNodeInactiveValues(root);
  dispatchInsert(list, 0, []);
  expect(readFieldNodeInactiveValues(root)).toEqual([
    { path: '/list/0', value: [] },
    { path: '/list/1', value: ['one', 'two'] },
    { path: '/list/2', value: ['three'] },
  ]);
  expect(previous).toEqual([
    { path: '/list/0', value: ['one', 'two'] },
    { path: '/list/1', value: ['three'] },
  ]);
  dispatchSetValue(getDispatchNode(root, 'show'), true);
  expect(list.local).toEqual([[], ['one', 'two'], ['three']]);
});

it('moves old descendant write addresses after an array has already re-entered', () => {
  const item: BlueprintSchema = {
    type: 'array',
    controls: { active: '../../show' },
    items: { type: 'string' },
  };
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      show: { type: 'boolean' },
      list: { type: 'array', prefixItems: [item, item, item] },
    },
  });

  dispatchMount(root, { show: true, list: [['first']] });
  const list = getDispatchNode(root, 'list');
  const old = getDispatchNode(list, '0', '0');
  dispatchSetValue(getDispatchNode(root, 'show'), false);
  dispatchSetValue(getDispatchNode(root, 'show'), true);
  dispatchSetValue(getDispatchNode(root, 'show'), false);
  dispatchInsert(list, 0, []);
  dispatchSetValue(old, 'after move');
  dispatchSetValue(getDispatchNode(root, 'show'), true);
  expect(readFieldNodeInactiveValues(root)).toEqual([
    { path: '/list/0/0', value: 'after move' },
  ]);
  expect(getDispatchNode(list, '1', '0').local).toBe('first');
  expect(old.local).toBe('first');
});
