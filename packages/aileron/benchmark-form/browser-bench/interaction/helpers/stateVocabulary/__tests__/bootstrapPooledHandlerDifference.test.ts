import { describe, expect, it } from 'vitest';

import { bootstrapPooledHandlerDifference } from '../bootstrapPooledHandlerDifference';

describe('paired pooled handler p95 difference', () => {
  it('detects a tail change while the median remains unchanged', () => {
    const B = Array.from({ length: 10 }, () => ({
      handler: [...Array.from({ length: 18 }, () => 1), 10, 10],
    }));
    const F = Array.from({ length: 10 }, () => ({
      handler: [...Array.from({ length: 18 }, () => 1), 13, 13],
    }));
    expect(bootstrapPooledHandlerDifference(B, F)).toBe(3);
  });
  it('uses paired indices for lane-shared drift', () => {
    const B = [1, 3, 8, 12].map((value) => ({ handler: [value] }));
    const F = [1, 3, 8, 12].map((value) => ({ handler: [value + 2] }));
    expect(bootstrapPooledHandlerDifference(B, F)).toBe(2);
  });
  it('preserves missing and unequal pages as unknown', () => {
    expect(bootstrapPooledHandlerDifference([], [])).toBeNull();
    expect(bootstrapPooledHandlerDifference([{ handler: [1] }], [])).toBeNull();
    expect(
      bootstrapPooledHandlerDifference([{ handler: [] }], [{ handler: [1] }]),
    ).toBeNull();
  });
});
