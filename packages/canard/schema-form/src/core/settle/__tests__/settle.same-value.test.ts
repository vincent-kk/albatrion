import { describe, expect, it } from 'vitest';

import { sameValue } from '../utils/compute/sameValue';
import { SetValueOption } from '../../types/value';
import { writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-derive
describe('settle value equivalence', () => {
  it('18C-50 sameValue compares nested plain values and SameValueZero primitives', () => {
    expect(sameValue(NaN, NaN)).toBe(true);
    expect(sameValue(-0, 0)).toBe(true);
    expect(sameValue([{ value: 1 }], [{ value: 1 }])).toBe(true);
    expect(sameValue([{ value: 1 }], [{ value: 2 }])).toBe(false);
    expect(sameValue({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(false);
    expect(sameValue(new Date(0), new Date(0))).toBe(false);
  });

  it('18C-50 keeps an equal terminal raw source reference at the write boundary', () => {
    const { root } = createTestTree({ type: 'string' });
    const first = { nested: { value: 1 } };
    writeSchemaNode(root, first, 'callerReplace', SetValueOption.Overwrite);
    writeSchemaNode(root, { nested: { value: 1 } },
      'callerReplace', SetValueOption.Overwrite);
    expect(root.raw).toBe(first);
  });
});
