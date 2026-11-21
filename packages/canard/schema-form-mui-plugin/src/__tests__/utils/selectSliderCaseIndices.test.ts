import { expect, it } from 'vitest';

import { selectSliderCaseIndices } from './selectSliderCaseIndices';

it('PR keeps all 224 schemas, all input values and every pair of input classes', () => {
  const dimensions = [2, 7, 4, 4, 5, 17];
  const count = dimensions.reduce((total, size) => total * size, 1);
  const selected = selectSliderCaseIndices(dimensions, false);
  expect(selected).toBeDefined();
  if (!selected) throw new Error('PR requires an explicit bounded matrix');
  expect(selected.size).toBeLessThanOrEqual(300);
  const snapshots = [
    Array.from({ length: count }, (_, index) => index),
    [...selected],
  ].map((indices) => {
    const schemas = new Set<string>(),
      pairs = new Set<string>();
    for (const index of indices) {
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(count);
      let remainder = index;
      const values = Array<number>(dimensions.length);
      for (let axis = dimensions.length - 1; axis >= 0; axis--) {
        values[axis] = remainder % dimensions[axis];
        remainder = Math.floor(remainder / dimensions[axis]);
      }
      schemas.add(values.slice(0, 4).join(':'));
      for (let left = 0; left < dimensions.length; left++)
        for (let right = left + 1; right < dimensions.length; right++)
          pairs.add(`${left}:${values[left]}/${right}:${values[right]}`);
    }
    return { schemas, pairs };
  });
  expect(snapshots[1]).toEqual(snapshots[0]);
});
it('complete local and pre-release profiles leave all 19040 frames and both lazy modes unfiltered', () => {
  expect(selectSliderCaseIndices([2, 7, 4, 4, 5, 17], true)).toBeUndefined();
});
