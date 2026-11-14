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

it.each([{ position: 3 }, { position: 4 }])(
  'R2 unused candidate at $position preserves unrelated inactive sources',
  ({ position }) => {
    for (const unused of [false, true]) {
      const last: BlueprintSchema = unused
        ? {
            type: 'object',
            allOf: [
              {
                controls: { active: false },
                properties: { unused: { type: 'number' } },
              },
              {
                controls: { active: false },
                properties: { unused: { type: 'string' } },
              },
            ],
          }
        : item('number');
      const { root } = createDispatchTree({
        type: 'object',
        properties: {
          show: { type: 'boolean' },
          list: {
            type: 'array',
            prefixItems:
              position === 3
                ? [item('number'), item('string'), item('number'), last]
                : [
                    item('number'),
                    item('string'),
                    item('number'),
                    item('number'),
                    last,
                  ],
          },
        },
      });
      dispatchMount(root, { show: true, list: [{ v: 1 }, { v: '2' }] });
      dispatchSetValue(getDispatchNode(root, 'show'), false);
      const list = getDispatchNode(root, 'list');
      dispatchInsert(list, 0, { v: 0 });
      expect(readFieldNodeInactiveValues(root)).toEqual([
        { path: '/list/0/v', value: 0 },
        { path: '/list/1/v', value: '1' },
        { path: '/list/2/v', value: 2 },
      ]);
      expect(root.local).toEqual({ show: false, list: [{}, {}, {}] });
      expect(root.emit).toEqual(root.local);
    }
  },
);

/** Build one gated field with a single kind and explicit source retention. */
function item(type: 'number' | 'string'): BlueprintSchema {
  return {
    type: 'object',
    properties: {
      v: {
        type,
        controls: { active: '../../../show', unsetOnInactive: false },
      },
    },
  };
}
