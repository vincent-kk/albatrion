import { afterEach, expect, it, vi } from 'vitest';

import { OwnedSchemaValues } from '../utils/finalize/OwnedSchemaValues';
import { freezeCreatedHintObjects } from '../utils/finalize/freezeCreatedHintObjects';
import * as guards from '../utils/finalize/isObjectRecord';
import { mergeHintGroup } from '../utils/merge/mergeHintGroup';

afterEach(() => vi.restoreAllMocks());

it('guards the merge-owned root and each created descendant, retaining borrowed references', () => {
  const calls = vi.spyOn(guards, 'isObjectRecord');
  const borrowed = { color: 'blue' };
  const earlier = { style: { nested: { first: 1 }, borrowed }, first: true };
  const later = { style: { nested: { second: 2 } }, last: true };
  const result = mergeHintGroup(earlier, later, false);
  expect(calls).toHaveBeenCalledTimes(3);
  expect(calls.mock.calls[0][0]).toBe(result);
  const style = calls.mock.calls[1][0];
  const nested = calls.mock.calls[2][0];
  expect(result).toEqual({
    style: { nested: { first: 1, second: 2 }, borrowed },
    first: true,
    last: true,
  });
  expect(Object.isFrozen(style)).toBe(true);
  expect(Object.isFrozen(nested)).toBe(true);
  expect(Object.isFrozen(borrowed)).toBe(false);
  expect(Object.isFrozen(earlier.style)).toBe(false);
  expect(Object.isFrozen(later.style)).toBe(false);
  expect(OwnedSchemaValues.has(earlier)).toBe(false);
  expect(OwnedSchemaValues.has(later)).toBe(false);
  expect(calls).toHaveBeenNthCalledWith(1, result);
});

it('returns before key enumeration for non-record inputs to the traversal', () => {
  const calls = vi.spyOn(guards, 'isObjectRecord');
  const keys = vi.spyOn(Object, 'keys');
  for (const result of [null, undefined, 0, '', false, () => {}]) {
    calls.mockClear();
    keys.mockClear();
    Reflect.apply(freezeCreatedHintObjects, undefined, [result, {}, {}]);
    const enumerations = keys.mock.calls.length;
    expect(calls).toHaveBeenCalledExactlyOnceWith(result);
    expect(enumerations).toBe(0);
  }
});
