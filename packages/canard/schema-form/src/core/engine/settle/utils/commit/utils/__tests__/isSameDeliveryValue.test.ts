import { describe, expect, it } from 'vitest';

import { isSameDeliveryValue } from '../isSameDeliveryValue';

describe('66C-01 SETTLE-043 sameValue judges delivery changes', () => {
  it('keeps identity semantics for watched objects rebuilt with equal content', () => {
    expect(isSameDeliveryValue({ a: 1 }, { a: 1 })).toBe(false);
    expect(isSameDeliveryValue(NaN, NaN)).toBe(true);
  });
});
