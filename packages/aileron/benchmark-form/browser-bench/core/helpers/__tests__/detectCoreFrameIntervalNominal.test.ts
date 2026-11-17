import { describe, expect, it } from 'vitest';

import { detectCoreFrameIntervalNominal } from '../detectCoreFrameIntervalNominal';

describe('detectCoreFrameIntervalNominal', () => {
  it('snaps supported empty rAF medians to their actual nominal periods', () => {
    expect(detectCoreFrameIntervalNominal(16.7)).toBe(1000 / 60);
    expect(detectCoreFrameIntervalNominal(8.34)).toBe(1000 / 120);
  });

  it('rejects unsupported and non-finite cadence instead of claiming an observation', () => {
    for (const value of [0, 12.5, 25, NaN, Infinity])
      expect(detectCoreFrameIntervalNominal(value)).toBeNull();
  });
});
