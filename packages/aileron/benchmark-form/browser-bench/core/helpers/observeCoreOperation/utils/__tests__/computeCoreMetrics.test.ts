import { expect, it } from 'vitest';

import { computeCoreMetrics } from '../computeCoreMetrics';

it('retains the primary frame fields and adds independent 8.3 ms gap evidence', () => {
  const { metrics } = computeCoreMetrics({
    operation: 'mount',
    validation: false,
    loadValue: null,
    startMs: 0,
    endMs: 36,
    durationMs: 36,
    frameIntervalMs: 8,
    frameIntervalNominalMs: 1000 / 120,
    stamps: [0, 8, 16, 36],
    records: [],
    writes: [],
    transitions: [],
    markerStateAtStart: null,
    reports: [],
    longTasks: { maxLongTaskMs: null, longTaskOverlapMs: 0 },
  });
  expect(metrics.frameBudget60.overBudgetFrames).toBe(1);
  expect(metrics.frameBudget60.frameOverflowMs).toBeCloseTo(3.3);
  expect(metrics.frameBudget120.overBudgetFrames).toBe(1);
  expect(metrics.frameBudget120.frameOverflowMs).toBeCloseTo(11.7);
  expect(metrics.frameBudget60.overBudgetFrames).toBe(metrics.overBudgetFrames);
  expect(metrics.frameBudget60.frameOverflowMs).toBe(metrics.frameOverflowMs);
});
