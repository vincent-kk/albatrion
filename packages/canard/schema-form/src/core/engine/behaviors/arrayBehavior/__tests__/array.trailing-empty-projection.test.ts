import { describe, expect, it } from 'vitest';

import { omitTrailingEmptyArray } from '../utils/projection/omitTrailingEmptyArray';

// filid:contract array-projection
describe('trailing empty projection', () => {
  it('VALUE-034 trims trailing empty objects and nulls left by object items', () => {
    const kept = { name: 'kept' };
    const local = [kept, null, {}];
    const projected = omitTrailingEmptyArray(local);
    expect(projected).toEqual([kept]);
    expect(projected[0]).toBe(kept);
    expect(local).toEqual([kept, null, {}]);
  });

  it('VALUE-034 trims trailing empty strings, arrays, objects and nil', () => {
    const source = ['kept', '', [], {}, Object.create(null), null, undefined];
    const projected = omitTrailingEmptyArray(source);
    expect(projected).toEqual(['kept']);
    expect(omitTrailingEmptyArray(source)).toBe(projected);
    expect(source).toHaveLength(7);
    expect(omitTrailingEmptyArray(['', null])).toEqual([]);
  });

  it('VALUE-034 keeps nonempty, nested-empty and non-plain values at the tail', () => {
    for (const source of [
      ['kept', false],
      ['kept', 0],
      ['kept', { name: '' }],
      ['kept', ['']],
      ['kept', new Date(0)],
    ])
      expect(omitTrailingEmptyArray(source)).toBe(source);
  });
});
