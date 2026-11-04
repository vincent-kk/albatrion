import { describe, expect, it } from 'vitest';

import { checkCoreSmokeProfile } from '../checkCoreSmokeProfile.mjs';

/** Conditional, nested and array paths complement the mandatory smoke. */
const remaining = [
  'mount-if-flat-500-none',
  'mount-if-flat-500-validate',
  'mount-nested-d5-f4-validate',
  'type-array-1000-validate-nonburst',
];
/** The mandatory five-case smoke keeps its two-run contract. */
const required = [
  'mount-flat-500-validate',
  'mount-flat-500-none',
  'mount-array-1000-validate',
  'type-flat-500-validate-nonburst',
  'first-key-flat-500-validate',
];

describe('checkCoreSmokeProfile', () => {
  it('keeps the default five-case two-run requirement', () => {
    expect(
      checkCoreSmokeProfile(
        { runs: 2, warmup: 1, cases: required.map((id) => ({ id })) },
        Object.fromEntries(required.map((id) => [id, []])),
      ).problems,
    ).toEqual([]);
  });

  it('accepts only the explicit four-case one-run remaining profile', () => {
    const summary = {
      runs: 1,
      warmup: 1,
      cases: remaining.map((id) => ({ id })),
    };
    const samples = Object.fromEntries(remaining.map((id) => [id, []]));
    expect(
      checkCoreSmokeProfile(summary, samples, 'remaining').problems,
    ).toEqual([]);
    expect(checkCoreSmokeProfile(summary, samples).problems).toContainEqual(
      expect.stringContaining('runs 2'),
    );
  });

  it('rejects a missing case in either artifact', () => {
    const summary = {
      runs: 1,
      warmup: 1,
      cases: remaining.slice(1).map((id) => ({ id })),
    };
    expect(
      checkCoreSmokeProfile(
        summary,
        Object.fromEntries(remaining.map((id) => [id, []])),
        'remaining',
      ).problems,
    ).toContainEqual(expect.stringContaining('case set'));
    expect(
      checkCoreSmokeProfile(
        { ...summary, cases: remaining.map((id) => ({ id })) },
        {},
        'remaining',
      ).problems,
    ).toContainEqual(expect.stringContaining('case set'));
  });

  it('rejects unknown profiles rather than accepting arbitrary subsets', () => {
    expect(() => checkCoreSmokeProfile({ cases: [] }, {}, 'custom')).toThrow(
      'Unknown smoke profile',
    );
  });
});
