import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount } from '../index';
import { createTestTree } from './fixtures/createTestTree';

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
  loadSchemaNodeAtMount(root, value, SetValueOption.Overwrite);
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
