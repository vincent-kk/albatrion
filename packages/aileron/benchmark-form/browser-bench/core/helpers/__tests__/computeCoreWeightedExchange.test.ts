import { describe, expect, it } from 'vitest';

import coreWeights from '../../../../fixtures/core-weights.json';
import type { CoreWeights } from '../../reportTypes';
import { computeCoreWeightedExchange } from '../computeCoreWeightedExchange';
import { createCoreTestCase } from './createCoreTestCase';

/** Weight fixtures include mounts, repeat typing, the one-off key and an excluded rebuild. */
const weights: CoreWeights = {
  'mount-flat-500-validate': { weight: 1, k: 1, basis: 'one mount' },
  'type-flat-500-validate-nonburst': { weight: 5000, k: 1, basis: 'typing' },
  'first-key-flat-500-validate': { weight: 1, k: 1, basis: 'first key' },
  'rebuild-flat-500': {
    weight: 5,
    k: 1,
    basis: 'bulk',
    excluded: 'no rebuild in 0.16.1',
  },
};

describe('computeCoreWeightedExchange', () => {
  it('computes weighted exchange with noise zeroed', () => {
    const exchange = computeCoreWeightedExchange(
      'blockingMs',
      [
        createCoreTestCase(
          'type-flat-500-validate-nonburst',
          { blockingMs: [1.2, 1] },
          { blockingMs: 'slower' },
        ),
        createCoreTestCase('first-key-flat-500-validate', {
          blockingMs: [30, 31],
        }),
        createCoreTestCase(
          'mount-flat-500-validate',
          { blockingMs: [0, 0] },
          { blockingMs: 'not observable' },
        ),
      ],
      weights,
    );
    const typing = exchange.rows.find(
      (row) => row.id === 'type-flat-500-validate-nonburst',
    );
    const firstKey = exchange.rows.find(
      (row) => row.id === 'first-key-flat-500-validate',
    );
    expect(typing).toMatchObject({
      weight: 5000,
      baselineMicros: 1000,
      candidateMicros: 1200,
      deltaMicros: 200,
      counted: true,
      contributionMicros: 1_000_000,
    });
    expect(firstKey).toMatchObject({
      deltaMicros: -1000,
      counted: false,
      reason: 'within noise',
      contributionMicros: 0,
    });
    expect(exchange.exchangeMicros).toBe(1_000_000);
    expect(
      exchange.rows.find((row) => row.id === 'mount-flat-500-validate')?.reason,
    ).toBe('< 50 ms not observable');
    expect(exchange.weightedBaselineMicros).toBe(5000 * 1000 + 31000);
    expect(exchange.weightedCandidateMicros).toBe(5000 * 1200 + 30000);
    expect(exchange.weightedRatio).toBeCloseTo(
      (5000 * 1200 + 30000) / (5000 * 1000 + 31000),
    );
  });

  it('keeps both first-key cases in the canonical weighted exchange at equal weight', () => {
    const ids = [
      'first-key-flat-500-validate',
      'first-key-flat-500-validate-after-load',
    ];
    const exchange = computeCoreWeightedExchange(
      'blockingMs',
      ids.map((id) =>
        createCoreTestCase(
          id,
          { blockingMs: [2, 1] },
          { blockingMs: 'slower' },
        ),
      ),
      coreWeights,
    );
    for (const id of ids)
      expect(exchange.rows.find((row) => row.id === id)).toMatchObject({
        weight: 1,
        k: 1,
        counted: true,
        contributionMicros: 1000,
      });
    expect(exchange.exchangeMicros).toBe(2000);
  });

  it('lists excluded rows and keeps the ratio null without a baseline sum', () => {
    const exchange = computeCoreWeightedExchange(
      'feedbackCommittedMs',
      [
        createCoreTestCase(
          'mount-flat-500-validate',
          { feedbackCommittedMs: [100, 90] },
          { feedbackCommittedMs: 'void' },
        ),
        createCoreTestCase('rebuild-flat-500', {
          feedbackCommittedMs: [10, 10],
        }),
      ],
      weights,
    );
    expect(exchange.metric).toBe('feedbackCommittedMs');
    expect(exchange.excluded).toEqual([
      'mount-flat-500-validate: void',
      'type-flat-500-validate-nonburst: not measured',
      'first-key-flat-500-validate: not measured',
      'rebuild-flat-500: no rebuild in 0.16.1',
    ]);
    expect(exchange.rows.every((row) => !row.counted)).toBe(true);
    expect(exchange.exchangeMicros).toBe(0);
    expect(exchange.weightedBaselineMicros).toBe(0);
    expect(exchange.weightedRatio).toBeNull();
  });
});
