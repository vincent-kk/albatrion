import { describe, expect, it } from 'vitest';

import { ratios } from '../ratios';
import { slotOrder } from '../slotOrder';
import { nearestRank } from '../nearestRank';
import { verdict } from '../verdict';

describe('speed harness statistics', () => {
  it('uses nearest-rank p10', () => {
    expect(nearestRank([10, 2, 8, 4, 6], 0.1)).toBe(2);
  });
  it('requires both control ratios and checks both candidate ratios', () => {
    expect(ratios(100, 101, 103)).toEqual({ candidate: 1.03, control: 1.01 });
    expect(verdict([1.01, 1.03], [0.98, 1.02])).toBe('pass');
    expect(verdict([1.04, 1], [1, 1])).toBe('over');
    expect(verdict([1, 1], [1, 1.021])).toBe('void');
  });
  it('rotates through all six slot orders', () => {
    expect(
      new Set(Array.from({ length: 6 }, (_, i) => slotOrder(i).join(','))).size,
    ).toBe(6);
    expect(slotOrder(6)).toEqual(slotOrder(0));
  });
});
