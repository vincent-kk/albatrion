import { describe, expect, it } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../utils/load/loadFieldNodeAtMount';

/** Count declaration-name reads across a real mount load without a timer. */
const initialLoadNameReads = (count: number): number => {
  const properties: Record<string, { type: 'number' }> = {};
  const value: Record<string, number> = {};
  for (let index = 0; index < count; index++) {
    const name = `field_${index}`;
    properties[name] = { type: 'number' };
    value[name] = index;
  }
  const { root } = createTestTree({ type: 'object', properties });
  let reads = 0;
  const childEntries = root.blueprintNode.childEntries.map((entry) => ({
    ...entry,
    get name() {
      reads++;
      return entry.name;
    },
  }));
  Object.defineProperty(root, 'blueprintNode', {
    value: { ...root.blueprintNode, childEntries },
  });
  loadFieldNodeAtMount(root, value, WriteOption.Overwrite);
  expect(root.children).toHaveLength(count);
  return reads;
};

describe('initial load work', () => {
  it('scales declaration inspections with the flat object size', () => {
    const small = initialLoadNameReads(1000);
    const large = initialLoadNameReads(2000);
    expect(large).toBeLessThanOrEqual(small * 2.2);
  });
});
