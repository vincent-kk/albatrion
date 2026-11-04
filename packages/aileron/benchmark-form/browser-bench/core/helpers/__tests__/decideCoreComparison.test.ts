import { describe, expect, it } from 'vitest';

import { decideCoreComparison } from '../decideCoreComparison';

describe('core comparison decision', () => {
  it('accepts the inclusive absolute control boundary', () => {
    expect(
      decideCoreComparison('mount-flat-500-none', [1], [2], [1.3], 1).verdict,
    ).toBe('slower');
  });
  it('requests one retry when control exceeds its band', () => {
    expect(
      decideCoreComparison('mount-flat-500-none', [10], [11], [10.31], 1)
        .verdict,
    ).toBe('retry');
  });
  it('voids the second invalid group regardless of candidate speed', () => {
    expect(
      decideCoreComparison('mount-flat-500-none', [10], [1], [11], 2).verdict,
    ).toBe('void');
  });
  it('uses the relative control band for larger cells', () => {
    expect(
      decideCoreComparison('mount-flat-500-none', [100], [105], [103], 1)
        .verdict,
    ).toBe('slower');
  });
  it.each([
    ['mount-flat-500-none', 1, 1.5, 'within noise'],
    ['rebuild-flat-500', 100, 103.01, 'slower'],
    ['mount-flat-500-none', 100, 96.99, 'faster'],
    ['type-flat-500-validate-nonburst', 0.2, 0.25, 'within noise'],
    ['type-flat-500-validate-nonburst', 2, 2.101, 'slower'],
    ['type-array-1000-validate-nonburst', 2, 1.899, 'faster'],
    ['first-key-flat-500-validate', 1, 1.5, 'within noise'],
    ['first-key-flat-500-validate', 100, 105.01, 'slower'],
    ['first-key-flat-500-validate', 100, 94.99, 'faster'],
  ])(
    'applies the metric threshold for %s (%s → %s)',
    (id, baseline, candidate, verdict) => {
      expect(
        decideCoreComparison(
          String(id),
          [Number(baseline)],
          [Number(candidate)],
          [Number(baseline)],
          1,
        ).verdict,
      ).toBe(verdict);
    },
  );
  it('rejects missing or nonfinite sample evidence', () => {
    expect(() =>
      decideCoreComparison('mount-flat-500-none', [], [1], [1], 1),
    ).toThrow();
    expect(() =>
      decideCoreComparison('mount-flat-500-none', [1], [NaN], [1], 1),
    ).toThrow();
  });
});
