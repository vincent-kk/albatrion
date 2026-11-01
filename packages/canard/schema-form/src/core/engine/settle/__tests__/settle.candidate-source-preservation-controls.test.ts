import { expect, it } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import {
  dispatchInsert,
  dispatchMount,
  dispatchRemove,
  dispatchSetValue,
} from '../../write';
import { getDispatchNode } from './fixtures/getDispatchNode';
import { readInactiveValuesAt } from './fixtures/readInactiveValuesAt';
import { readRetainedSlotRaw } from './fixtures/readRetainedSlotRaw';

it.each(['items', 'prefixItems'] as const)(
  '%s single-kind off-write retains whole raw, inactiveValues and entry interpretation',
  (keyword) => {
    const { root } = createDispatchTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        list: {
          type: 'array',
          controls: { active: '../open' },
          [keyword]:
            keyword === 'items' ? { type: 'number' } : [{ type: 'number' }],
        },
      },
    });
    dispatchMount(root, { open: false, list: [] });
    dispatchSetValue(root, { open: false, list: ['7'] });
    expect(root.blueprintNode.hasCandidateDescendants).toBeUndefined();
    const latent = readRetainedSlotRaw(root, '/list', 'array');
    expect(latent).toEqual(['7']);
    expect(readInactiveValuesAt(root, '')).toEqual([
      { path: '/list', value: ['7'] },
    ]);
    dispatchSetValue(getDispatchNode(root, 'open'), true);
    expect(root.emit).toEqual({ open: true, list: [7] });
    expect(readInactiveValuesAt(root, '')).toEqual([]);
  },
);

it('candidate-free structural moves reuse their existing source records', () => {
  const { root } = createDispatchTree({
    type: 'array',
    items: { type: 'number' },
  });
  dispatchMount(root, [1, 2]);
  const first = getDispatchNode(root, '0');
  const second = getDispatchNode(root, '1');
  dispatchInsert(root, 0, 3);
  expect(getDispatchNode(root, '1')).toBe(first);
  expect(getDispatchNode(root, '2')).toBe(second);
  dispatchRemove(root, 0);
  expect(getDispatchNode(root, '0')).toBe(first);
  expect(getDispatchNode(root, '1')).toBe(second);
  expect(root.emit).toEqual([1, 2]);
});
