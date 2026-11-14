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
  ['insert', 'string'],
  ['remove', 'string'],
  ['insert', 'number'],
  ['remove', 'number'],
] as const)(
  'moves depth-zero %s root candidates from %s',
  (operation, live) => {
    const current: BlueprintSchema = {
      type: live,
      default: live === 'string' ? 'held' : 37,
    };
    const other: BlueprintSchema = {
      type: live === 'string' ? 'number' : 'string',
    };
    const positions =
      operation === 'insert' ? [current, other] : [other, current];
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        a: { type: 'boolean' },
        b: { type: 'boolean' },
        list: {
          type: 'array',
          allOf: [
            { controls: { active: '../a' }, prefixItems: positions },
            {
              controls: { active: '../b' },
              prefixItems: operation === 'insert' ? [other] : [other, other],
            },
          ],
        },
      },
    });

    const stored = live === 'string' ? 37 : 'held';
    const liveValue = live === 'string' ? 'held' : 37;
    dispatchMount(root, {
      a: false,
      b: true,
      list: operation === 'insert' ? [stored] : [stored, stored],
    });
    const list = getDispatchNode(root, 'list');
    dispatchSetValue(getDispatchNode(root, 'b'), false);
    dispatchSetValue(getDispatchNode(root, 'a'), true);
    const sourceIndex = operation === 'insert' ? 0 : 1;
    const original = getDispatchNode(list, String(sourceIndex));
    expect(original.local).toBe(liveValue);
    if (operation === 'insert') dispatchInsert(list, 0, liveValue);
    else dispatchRemove(list, 0);
    const destination = operation === 'insert' ? 1 : 0;
    expect(getDispatchNode(list, String(destination)).local).toBe(stored);
    expect(original.detached).toBe(true);
    if (operation === 'insert') dispatchRemove(list, 0);
    else dispatchInsert(list, 0, stored);
    expect(getDispatchNode(list, String(sourceIndex)).local).toBe(liveValue);
    dispatchSetValue(getDispatchNode(root, 'a'), false);
    dispatchSetValue(getDispatchNode(root, 'b'), true);
    expect(getDispatchNode(list, String(sourceIndex)).local).toBe(stored);
    expect(readFieldNodeInactiveValues(root)).toEqual([]);
  },
);
