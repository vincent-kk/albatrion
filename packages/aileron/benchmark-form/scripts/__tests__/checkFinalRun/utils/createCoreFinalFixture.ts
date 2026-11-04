import { createCoreTestMeasurement } from '../../../../browser-bench/core/helpers/buildCoreCaseResult/__tests__/createCoreTestMeasurement';
import { buildCoreCaseResult } from '../../../../browser-bench/core/helpers/buildCoreCaseResult/buildCoreCaseResult';
import type { CoreVariantGroups } from '../../../../browser-bench/core/helpers/buildCoreCaseResult/buildCoreCaseResult';
import { computeCoreWeightedExchange } from '../../../../browser-bench/core/helpers/computeCoreWeightedExchange';
import { readCoreWeights } from '../../../../browser-bench/core/helpers/readCoreWeights';
import { selectCoreObservability } from '../../../../browser-bench/core/helpers/selectCoreObservability';
import type { CoreSummary } from '../../../../browser-bench/core/reportTypes';
import type { CoreMetrics } from '../../../../browser-bench/core/types';
import { getCoreFixture } from '../../../../fixtures/core/getCoreFixture';

/**
 * Build synthetic 60 Hz comparison evidence for every final-run case.
 * @param runs - Positive page count per variant; 20 exercises the CI artifact contract.
 * @returns Summary and raw samples rebuilt from the same measurements; this is gate QA, not performance evidence.
 */
export function createCoreFinalFixture(runs = 20) {
  const ids = [
    'mount-flat-500-none',
    'mount-flat-500-validate',
    'mount-if-flat-500-none',
    'mount-if-flat-500-validate',
    'mount-nested-d5-f4-validate',
    'mount-array-1000-validate',
    'type-flat-500-validate-nonburst',
    'type-array-1000-validate-nonburst',
    'first-key-flat-500-validate',
  ];
  const samples: Record<string, { attempt: 1; samples: CoreVariantGroups }[]> =
    {};
  const cases = ids.map((id) => {
    const fixture = getCoreFixture(id);
    const row = selectCoreObservability(fixture);
    const measurement = createCoreTestMeasurement();
    for (const [name, expectation] of Object.entries(row.metrics)) {
      if (expectation === 'null')
        Object.assign(measurement.metrics, { [name]: null });
      else if (
        expectation === 'required' &&
        measurement.metrics[name as keyof CoreMetrics] === null
      )
        Object.assign(measurement.metrics, { [name]: 40 });
    }
    Object.assign(measurement.counts, {
      inputs: fixture.expectedInputs,
      markers: row.markers,
      validations: fixture.validation ? 1 : 0,
      compiles: 0,
      lifetimeCompiles: fixture.validation ? 1 : 0,
      lifetimeValidations: fixture.validation ? 1 : 0,
    });
    measurement.counts.writes =
      fixture.operation === 'type'
        ? 20
        : fixture.operation === 'first-key'
          ? 1
          : 0;
    if (fixture.operation === 'first-key') {
      measurement.writes = measurement.writes?.slice(0, 1);
      measurement.metrics.blockingMs = 4;
      measurement.metrics.feedbackClasses = {
        exact: 1,
        censored: 0,
        noChange: 0,
        superseded: 0,
      };
    } else if (fixture.operation !== 'type') {
      delete measurement.writes;
      measurement.metrics.feedbackClasses = {
        exact: 0,
        censored: 0,
        noChange: 0,
        superseded: 0,
      };
    }
    if (!fixture.validation) {
      measurement.metrics.preFrameValidatorMs = 0;
      measurement.metrics.postFrameValidatorMs = 0;
    }
    const groups: CoreVariantGroups = {
      candidate: Array.from({ length: runs }, () =>
        structuredClone(measurement),
      ),
      baseline: Array.from({ length: runs }, () =>
        structuredClone(measurement),
      ),
      control: Array.from({ length: runs }, () => structuredClone(measurement)),
    };
    samples[id] = [{ attempt: 1, samples: groups }];
    return buildCoreCaseResult(id, 1, groups, true);
  });
  const weights = readCoreWeights();
  const summary: CoreSummary = {
    mode: 'compare',
    revision: 'candidate-fixture',
    baselineRevision: 'baseline-fixture',
    runs,
    warmup: 3,
    cases,
    weighted: {
      blocking: computeCoreWeightedExchange('blockingMs', cases, weights),
      feedback: computeCoreWeightedExchange(
        'feedbackCommittedMs',
        cases,
        weights,
      ),
    },
  };
  return { samples, summary };
}
