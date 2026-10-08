import { bootstrap, validationA121 } from './report-verdict-121.mjs';

/** Nearest-rank quantile shared with report-verdict-121's noise width. */
const percentile = (values, proportion) => values.toSorted((a, b) => a - b)[Math.ceil(values.length * proportion) - 1];

/**
 * Evaluate (ga) for one single-bundle core worker from its own empty controls, samples and boundary pass.
 * The timing half and noise width are report-verdict-121's (empty-wait p95 absolute deviation per call, both median
 * bootstrap half-widths and the calibration median uncertainty, 1 µs floor). The boundary half counts the shared
 * scheduler wrapper and global setImmediate/setTimeout calls in `scheduled` (all must stay zero), and additionally
 * requires every global queueMicrotask callback queued in the window to have run before the microtask clock.
 * @param worker - measure-core-worker-129 output: `summary.verdictColumns`, `summary.interactionCount`,
 *   `timings[mode]` rows `[microtaskMs, sentinelEndToEndMs, pairedEmptyTailMs]`, `empty.before/after` and
 *   `ordering[mode][key].p99`
 * @param seed - Positive integer seed base for the per-process bootstraps
 * @returns Per verdict mode `{ differenceMs, noiseMs, withinNoise, zeroEngineMacrotasks, microtasksDrained, passed }`
 */
export function gaValidation129(worker, seed) {
  const { summary, empty, ordering, timings } = worker;
  const controls = [...empty.before, ...empty.after];
  const emptyEnd = percentile(controls.map(row => row[1]), .5), emptyMicro = percentile(controls.map(row => row[0]), .5);
  const waiting = controls.map(row => row[1] - row[0]), waitMedian = percentile(waiting, .5);
  const emptyNoise = percentile(waiting.map(value => Math.abs(value - waitMedian)), .95);
  const endCi = bootstrap(controls.map(row => row[1]), seed + 1), microCi = bootstrap(controls.map(row => row[0]), seed + 2);
  return Object.fromEntries(summary.verdictColumns.map(mode => {
    const callCount = mode === 'update' ? summary.interactionCount : mode === 'axis-update' ? 2 : 1;
    const rows = timings[mode];
    const microtask = rows.map(row => row[0] - emptyMicro * callCount);
    const sentinel = rows.map(row => row[1] - emptyEnd * callCount);
    const pairedSentinel = sentinel.map((value, index) => value - (rows[index][2] - callCount * (emptyEnd - emptyMicro)));
    const sentinelCi = bootstrap(sentinel, seed + 95), expectedCi = bootstrap(microtask, seed + 96);
    const noise = Math.max(.001, callCount * emptyNoise + sentinelCi.halfWidth + expectedCi.halfWidth +
      callCount * (endCi.halfWidth + microCi.halfWidth));
    const result = validationA121(pairedSentinel, microtask, noise, [ordering[mode]]);
    const microtasksDrained = ordering[mode].microtasksPendingAtMicrotasks.p99 === 0;
    return [mode, { ...result, microtasksDrained, passed: result.passed && microtasksDrained }];
  }));
}
