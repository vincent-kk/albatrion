import { describe, expect, it } from 'vitest';

import { dispatchClear, dispatchMount, dispatchResetSubtree } from '../index';
import { createDispatchTree } from './fixtures/createDispatchTree';

describe('65C-03 detached nodes keep no delivery capture', () => {
  it('resetSubtree on a perished item records no change fact and no affected path', () => {
    const { root, runtime } = createDispatchTree({ type: 'object', properties: {
      w: { type: 'string', controls: { watch: ['#/rows/0/v'] } },
      rows: { type: 'array', items: { type: 'object', properties: { v: { type: 'string' } } } },
    } });
    dispatchMount(root, { w: 'x', rows: [{ v: 'a' }] });
    const rows = root.children?.find((child) => child.name === 'rows');
    const item = rows?.children?.[0];
    if (!rows || !item) throw new Error('Mounted rows item is missing');
    dispatchClear(rows);
    expect(item.detached).toBe(true);
    dispatchResetSubtree(item);
    expect(item.deliveryChanges).toBe(0);
    expect(runtime.deliveryAffectedPaths?.size ?? 0).toBe(0);
  });
});
