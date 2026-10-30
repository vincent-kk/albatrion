import { expect, it } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchSetValue } from '../../write';
import { getDispatchNode } from './fixtures/getDispatchNode';
import { readInactiveValuesAt } from './fixtures/readInactiveValuesAt';
import { readRetainedSlotRaw } from './fixtures/readRetainedSlotRaw';

it('preserves reachable explicit-clear descendants when exit writes are suppressed', () => {
  const { root, runtime } = createDispatchTree({
    type: 'object',
    properties: { a: { type: 'boolean' } },
    allOf: [
      {
        controls: { active: './a' },
        properties: {
          v: {
            type: 'object',
            properties: {
              x: { type: 'number', controls: { unsetOnInactive: true } },
            },
          },
        },
      },
      { controls: { active: false }, properties: { v: { type: 'string' } } },
    ],
  });
  dispatchMount(root, { a: true, v: { x: 37 } });
  runtime.disableAutomaticWrites = true;
  dispatchSetValue(getDispatchNode(root, 'a'), false);
  expect(root.emit).toEqual({ a: false });
  expect(readRetainedSlotRaw(root, '/v/x', 'number')).toBe(37);
  expect(readInactiveValuesAt(root, '')).toEqual([{ path: '/v/x', value: 37 }]);
  dispatchSetValue(getDispatchNode(root, 'a'), true);
  expect(root.emit).toEqual({ a: true, v: { x: 37 } });
});
