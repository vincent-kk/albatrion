import type { CoreSummary } from '../../reportTypes';
import { formatCoreBaselineOverflow } from './utils/formatCoreBaselineOverflow';
import { formatCoreFeedbackClasses } from './utils/formatCoreFeedbackClasses';
import { formatCoreFrameBudget } from './utils/formatCoreFrameBudget';
import { formatCoreMedian } from './utils/formatCoreMedian';
import { formatCoreMetricPair } from './utils/formatCoreMetricPair';
import { formatCoreNumber } from './utils/formatCoreNumber';
import { formatCoreRatio } from './utils/formatCoreRatio';
import { formatCoreTypingSpread } from './utils/formatCoreTypingSpread';
import { renderCoreWeightedExchange } from './utils/renderCoreWeightedExchange';

/**
 * Render the legend and the five summary tables shown locally, in the workflow summary and in the final report.
 * @param summary - Completed cases with their metrics; typing values are per write, frame observations per window.
 * @returns Markdown; measure mode omits baseline columns' values and the weighted table.
 */
export function renderCoreSummary(summary: CoreSummary): string {
  const rows = summary.cases;
  return [
    '# Core form browser benchmark',
    '',
    `${summary.mode}; ${summary.runs} runs and ${summary.warmup} warmup pages per variant.`,
    '',
    '## Legend',
    '',
    '- Units are ms. For type cases, elapsed time is the mean handler duration over 20 writes; blocking, validator and feedback values are repeat costs for writes 2–20 (per write; the first write appears as first-write ms in table 4 and in the first-key rows). Other cases are per operation. Frame observations cover the entire 20-write input window, including waits between keys.',
    '- First key: first-key-flat-500-validate types immediately at the first paint, so scheduled load-validation compilation may overlap the measurement window. first-key-flat-500-validate-after-load uses the same fixture and types after at least one onValidate report, a recorded validation run and no pending run (identical for both variants, 1000 ms limit, wait excluded from durationMs). Both latency overlapping initial load and input latency after load validation are reported; both rows enter the exchange with weight 1.',
    '- The nominal interval frameIntervalNominalMs is 1000/Hz ms, classifying the empty-rAF median as 60/120 Hz; table 4 shows baseline/candidate values. Tolerance is ±3 ms; final CI runs allow only 60 Hz (13.7–19.7 ms). Over-budget frame counts are medians across pages. Frame budgets are 16.7 ms (60 Hz, primary) and 8.3 ms (120 Hz, secondary). The frames columns are median blocking / the corresponding budget; overflow is max(0, median − the corresponding budget), with baseline overflow status shown for each budget. UX verdicts and weighted exchange retain the 16.7 ms budget; 8.3 ms columns are informational. mount/rebuild are N/A because blocking below 50 ms cannot be measured; the longest Long Task ms is reported instead.',
    '- Ratio = candidate / baseline; Δ % = (candidate − baseline) / baseline × 100; JSON null ratios/percentages for a baseline of 0 or an unavailable comparison are N/A; undefined, when there is no comparison, is —. Exchange units are µs/event × weight.',
    '- The Long Task API threshold is 50 ms: "< 50" means no observation, not 0. The longest Long Task is the original duration of a task overlapping the window; the sum within the window includes only overlapping portions.',
    '- Frame intervals, longest intervals and total overflow are observed rAF intervals, distinct from CPU blocking. Validator segments are split before/after the first frame rather than synchronous/deferred (input validation in 0.16.1 is a macrotask and can run before the first rAF).',
    '- Visible feedback (type) is the conditional mean of exact writes whose marker transition was observed before the next key. If class counts (exact/censored/noChange/superseded) differ between variants, do not generalize this to overall feedback improvement. Mount costs excluded from the blocking exchange are unmeasured, not 0.',
    '- UX verdicts: blocking uses the RAIL input-handling target of 50 ms (standard; type/first-key: ≤ 16.7 ok, ≤ 50 perceptible, otherwise janky; mount/rebuild: Long Task "< 50" ok, ≤ 100 perceptible [custom], otherwise janky). Feedback uses the RAIL response target of 100 ms (standard; ≤ 300 perceptible is a custom threshold); mount uses custom load thresholds of ≤ 1000 ok and ≤ 2000 perceptible. n/a means not observable.',
    '- Verdicts are advisory. Elapsed-time verdicts retain the existing rules (typing 0.05 ms, otherwise 0.5 ms or 5 %/3 %; an invalid baseline/control group is retried once, then marked void). Latency metrics (validator settlement, visible feedback, report callback and frame intervals) use max(2 ms, 5 %); CPU metrics (blocking, Long Task and validator segments) use max(0.5 ms, 5 %). If a metric-specific control group falls outside the band, only that metric is void.',
    '- validate cases add a root probe leaf `/probe` (default x, odd length), producing exactly one `/probe` error in both variants. Other item errors in array fixtures have the same cost in both variants and are outside the measured path.',
    '',
    '## 1. Elapsed and synchronous work',
    '',
    '| Case | Baseline ms | Candidate ms | Candidate p95 | Ratio | Δ ms | Δ % | Verdict | Attempt |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: |',
    ...rows.map(
      (row) =>
        `| ${row.id} | ${formatCoreNumber(row.baseline?.medianMs)} | ${formatCoreNumber(row.candidate.medianMs)} | ${formatCoreNumber(row.candidate.p95Ms)} | ${formatCoreRatio(row.metrics.durationMs.ratio)} | ${formatCoreNumber(row.deltaMs)} | ${formatCoreRatio(row.metrics.durationMs.deltaPercent, 1)} | ${row.verdict} | ${row.attempt ?? '—'} |`,
    ),
    '',
    '## 2. Blocking',
    '',
    '| Case | Baseline blocking ms | Candidate blocking ms | Δ % | Verdict | 16.7 ms frames (baseline/candidate) | 16.7 ms overflow ms (baseline/candidate) | 16.7 ms baseline also over budget | 8.3 ms frames (baseline/candidate) | 8.3 ms overflow ms (baseline/candidate) | 8.3 ms baseline also over budget | Longest Long Task ms (baseline/candidate) | Long Task sum within window ms (baseline/candidate) | Pre-frame validator ms (baseline/candidate) | Post-frame validator ms (baseline/candidate) |',
    '| --- | ---: | ---: | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...rows.map(
      (row) =>
        `| ${row.id} | ${formatCoreMedian(row.metrics.blockingMs.baseline)} | ${formatCoreMedian(row.metrics.blockingMs.candidate)} | ${formatCoreRatio(row.metrics.blockingMs.deltaPercent, 1)} | ${row.metrics.blockingMs.verdict} | ${formatCoreFrameBudget(row.budget.baseline, 'frames')} / ${formatCoreFrameBudget(row.budget.candidate, 'frames')} | ${formatCoreFrameBudget(row.budget.baseline, 'overflowMs')} / ${formatCoreFrameBudget(row.budget.candidate, 'overflowMs')} | ${formatCoreBaselineOverflow(row.budget.baseline)} | ${formatCoreFrameBudget(row.budget120.baseline, 'frames')} / ${formatCoreFrameBudget(row.budget120.candidate, 'frames')} | ${formatCoreFrameBudget(row.budget120.baseline, 'overflowMs')} / ${formatCoreFrameBudget(row.budget120.candidate, 'overflowMs')} | ${formatCoreBaselineOverflow(row.budget120.baseline)} | ${formatCoreMetricPair(row, 'maxLongTaskMs')} (observed ${row.frames.baseline?.longTaskObservedSamples ?? '—'}/${row.baseline?.samples ?? '—'} / ${row.frames.candidate.longTaskObservedSamples}/${row.candidate.samples}) | ${formatCoreMetricPair(row, 'longTaskOverlapMs')} | ${formatCoreMetricPair(row, 'preFrameValidatorMs')} | ${formatCoreMetricPair(row, 'postFrameValidatorMs')} |`,
    ),
    '',
    '## 3. Feedback',
    '',
    '| Case | Validator settled ms (baseline/candidate) | Visible feedback ms (baseline/candidate) | Ratio | Δ % | Verdict | Report callback ms (baseline/candidate, load only) | Feedback classes exact/censored/noChange/superseded (baseline) | Feedback classes (candidate) | Coalesced writes (baseline/candidate) |',
    '| --- | --- | --- | ---: | ---: | --- | --- | --- | --- | --- |',
    ...rows.map(
      (row) =>
        `| ${row.id} | ${formatCoreMetricPair(row, 'validatorSettledMs')} | ${formatCoreMetricPair(row, 'feedbackCommittedMs')} | ${formatCoreRatio(row.metrics.feedbackCommittedMs.ratio)} | ${formatCoreRatio(row.metrics.feedbackCommittedMs.deltaPercent, 1)} | ${row.metrics.feedbackCommittedMs.verdict} | ${formatCoreMetricPair(row, 'validationReportedMs')} | ${formatCoreFeedbackClasses(row.typing, 'baseline')} | ${formatCoreFeedbackClasses(row.typing, 'candidate')} | ${row.typing ? `${row.typing.baseline?.coalescedWrites ?? '—'} / ${row.typing.candidate.coalescedWrites}` : '—'} |`,
    ),
    '',
    '## 4. Frame observations and UX',
    '',
    '| Case | Nominal interval ms (baseline/candidate) | Longest interval ms (baseline/candidate) | Total overflow ms (baseline/candidate) | Over-budget frames (baseline/candidate) | 8.3 ms total overflow ms (baseline/candidate) | 8.3 ms over-budget frames (baseline/candidate) | Over-budget frame verdict | Typing first-write ms · max handler ms · over-budget count (baseline) | Same values (candidate) | UX blocking (baseline/candidate) | UX feedback (baseline/candidate) |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...rows.map(
      (row) =>
        `| ${row.id} | ${row.frames.baseline?.frameIntervalNominalMs.map((period) => formatCoreNumber(period)).join(', ') ?? '—'} / ${row.frames.candidate.frameIntervalNominalMs.map((period) => formatCoreNumber(period)).join(', ')} | ${formatCoreMetricPair(row, 'longestFrameMs')} | ${formatCoreMetricPair(row, 'frameOverflowMs')} | ${formatCoreNumber(row.frames.baseline?.overBudgetFrames.medianMs, 1)} / ${formatCoreNumber(row.frames.candidate.overBudgetFrames.medianMs, 1)} | ${formatCoreNumber(row.frames.baseline?.frameBudget120.frameOverflowMs.medianMs)} / ${formatCoreNumber(row.frames.candidate.frameBudget120.frameOverflowMs.medianMs)} | ${formatCoreNumber(row.frames.baseline?.frameBudget120.overBudgetFrames.medianMs, 1)} / ${formatCoreNumber(row.frames.candidate.frameBudget120.overBudgetFrames.medianMs, 1)} | ${row.metrics.frameOverflowMs.verdict} | ${formatCoreTypingSpread(row.typing, 'baseline')} | ${formatCoreTypingSpread(row.typing, 'candidate')} | ${row.ux.baseline?.blocking ?? '—'} / ${row.ux.candidate.blocking} | ${row.ux.baseline?.feedback ?? '—'} / ${row.ux.candidate.feedback} |`,
    ),
    '',
    ...(summary.weighted
      ? [
          '## 5. Weighted exchange',
          '',
          ...renderCoreWeightedExchange(
            'Blocking exchange',
            summary.weighted.blocking,
          ),
          ...renderCoreWeightedExchange(
            'Feedback exchange (conditional mean of exact writes)',
            summary.weighted.feedback,
          ),
        ]
      : []),
    'An invalid baseline/control group is retried once, then marked void.',
    '',
  ].join('\n');
}
