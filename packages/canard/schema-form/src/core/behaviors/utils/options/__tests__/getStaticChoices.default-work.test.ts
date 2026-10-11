import { expect, it, vi } from 'vitest';

import { getStaticChoices } from '../getStaticChoices';

it('links optionless effective schemas to one frozen default while keeping each memo lookup', () => {
  const first = { schema: { type: 'string' as const }, typeConflict: false };
  const second = { schema: { type: 'number' as const }, typeConflict: false };
  const freeze = vi.spyOn(Object, 'freeze');
  let left, right, repeated;
  let calls = 0;
  try {
    left = getStaticChoices(first);
    right = getStaticChoices(second);
    repeated = getStaticChoices(first);
    calls = freeze.mock.calls.length;
  } finally {
    freeze.mockRestore();
  }
  expect(calls).toBe(0);
  expect(left).toBe(right);
  expect(repeated).toBe(left);
  expect(left).toEqual({ omitEmpty: true, omitTrailing: false, trim: false, propertyKeys: [] });
  expect(Object.isFrozen(left)).toBe(true);
  expect(Object.isFrozen(left?.propertyKeys)).toBe(true);
});

it('keeps options and filtered propertyKeys independent from the default and authored arrays', () => {
  const keys = ['second', 1, 'first'];
  const effective = { schema: { type: 'object' as const,
    options: { omitEmpty: false, omitTrailing: true, trim: true, propertyKeys: keys } }, typeConflict: false };
  const result = getStaticChoices(effective);
  expect(result).toEqual({ omitEmpty: false, omitTrailing: true, trim: true, propertyKeys: ['second', 'first'] });
  expect(result.propertyKeys).not.toBe(keys);
  expect(Object.isFrozen(result.propertyKeys)).toBe(true);
  expect(Object.isFrozen(keys)).toBe(false);
  expect(getStaticChoices(effective)).toBe(result);
  expect(getStaticChoices({ schema: true, typeConflict: false })).not.toBe(result);
});
