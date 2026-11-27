import type { CoreFixture } from '../../../../../fixtures/core/types';
import type {
  CoreInputRecord,
  CoreMarkerTransition,
  CoreMetrics,
  CoreValidationReport,
  CoreValidatorRecord,
  CoreWriteMetrics,
} from '../../../types';
import {
  CORE_FRAME_BUDGET_120_MS,
  CORE_FRAME_BUDGET_MS,
} from '../../coreFrameBudgetMs';
import type { CoreLongTaskSummary } from '../../observeCoreLongTasks';
import { classifyCoreWrites } from './classifyCoreWrites';
import { splitCoreValidatorSegments } from './splitCoreValidatorSegments';
import { summarizeCoreFrameGaps } from './summarizeCoreFrameGaps';

/** Everything the pure metric computation needs from the observers. */
export interface CoreMetricsInput {
  /** Measured public operation. */
  operation: CoreFixture['operation'];
  /** Whether validator and marker conditions apply. */
  validation: boolean;
  /** Probe default for validated loads; null otherwise. */
  loadValue: string | null;
  /** Start mark. */
  startMs: number;
  /** Window end. */
  endMs: number;
  /** Existing elapsed metric. */
  durationMs: number;
  /** Median empty rAF gap before the window. */
  frameIntervalMs: number;
  /** Detected nominal period of the calibrated compositor. */
  frameIntervalNominalMs: number;
  /** Animation frame clock readings. */
  stamps: readonly number[];
  /** Page-lifetime validator records. */
  records: readonly CoreValidatorRecord[];
  /** Trusted input records of typing and first-key. */
  writes: CoreInputRecord[];
  /** Marker transitions. */
  transitions: CoreMarkerTransition[];
  /** Marker state before the operation. */
  markerStateAtStart: '0' | '1' | null;
  /** onValidate reports. */
  reports: readonly CoreValidationReport[];
  /** Window Long Task summary. */
  longTasks: CoreLongTaskSummary;
}

/** Mean of the numbers, or null when there are none. */
const meanOf = (values: (number | null)[]) => {
  const numbers = values.filter((value): value is number => value !== null);
  return numbers.length
    ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length
    : null;
};

/** First frame stamp strictly after a clock reading. */
const firstFrameAfter = (stamps: readonly number[], atMs: number) =>
  stamps.find((stamp) => stamp > atMs) ?? null;

/**
 * Derive the per-sample metrics from the observers' evidence; pure.
 * @param input - Observer evidence and window bounds.
 * @returns Metrics and, for typing and first-key, per-write attribution. Typing means cover writes 2–20; write 1 stays in `firstWriteMs` and `writes[0]`.
 */
export function computeCoreMetrics(input: CoreMetricsInput): {
  metrics: CoreMetrics;
  writes: CoreWriteMetrics[];
} {
  const { startMs, endMs, stamps, records } = input;
  const typed = input.operation === 'type' || input.operation === 'first-key';
  const frames = summarizeCoreFrameGaps(
    stamps,
    startMs,
    endMs,
    CORE_FRAME_BUDGET_MS,
  );
  const secondaryFrames = summarizeCoreFrameGaps(
    stamps,
    startMs,
    endMs,
    CORE_FRAME_BUDGET_120_MS,
  );
  const base: CoreMetrics = {
    frameBudget60: {
      frameOverflowMs: frames.frameOverflowMs,
      overBudgetFrames: frames.overBudgetFrames,
    },
    frameBudget120: {
      frameOverflowMs: secondaryFrames.frameOverflowMs,
      overBudgetFrames: secondaryFrames.overBudgetFrames,
    },
    durationMs: input.durationMs,
    blockingMs: null,
    maxLongTaskMs: input.longTasks.maxLongTaskMs,
    firstWriteMs: null,
    longTaskOverlapMs: input.longTasks.longTaskOverlapMs,
    preFrameValidatorMs: 0,
    postFrameValidatorMs: 0,
    validatorSettledMs: null,
    feedbackCommittedMs: null,
    feedbackClasses: { exact: 0, censored: 0, noChange: 0, superseded: 0 },
    validationReportedMs: null,
    frames: frames.frames,
    frameIntervalMs: input.frameIntervalMs,
    frameIntervalNominalMs: input.frameIntervalNominalMs,
    longestFrameMs: frames.longestFrameMs,
    frameOverflowMs: frames.frameOverflowMs,
    overBudgetFrames: frames.overBudgetFrames,
    coalescedWrites: 0,
  };
  if (!typed) {
    const segments = splitCoreValidatorSegments(
      records,
      startMs,
      endMs,
      firstFrameAfter(stamps, startMs),
    );
    base.preFrameValidatorMs = segments.preFrameMs;
    base.postFrameValidatorMs = segments.postFrameMs;
    if (!input.validation) return { metrics: base, writes: [] };
    const run = records.find(
      (record) =>
        record.kind === 'run' &&
        record.startMs >= startMs &&
        record.settledMs >= record.startMs &&
        record.probeValue === input.loadValue,
    );
    const shown = input.transitions.find(
      (transition) => transition.atMs >= startMs && transition.state === '1',
    );
    const report = input.reports.find(
      (entry) => entry.atMs >= startMs && entry.probeError,
    );
    base.validatorSettledMs = run ? run.settledMs - startMs : null;
    base.feedbackCommittedMs = shown ? shown.atMs - startMs : null;
    base.validationReportedMs = report ? report.atMs - startMs : null;
    return { metrics: base, writes: [] };
  }
  const writes = classifyCoreWrites(
    input.writes,
    records,
    input.transitions,
    input.markerStateAtStart,
    endMs,
  );
  const repeats = input.operation === 'type' ? writes.slice(1) : writes;
  const segments = input.writes.map((write, index) =>
    splitCoreValidatorSegments(
      records,
      write.start,
      input.writes[index + 1]?.start ?? endMs,
      firstFrameAfter(stamps, write.start),
    ),
  );
  const repeatSegments =
    input.operation === 'type' ? segments.slice(1) : segments;
  base.blockingMs = meanOf(repeats.map((write) => write.handlerMs));
  base.firstWriteMs =
    input.operation === 'type' ? (writes[0]?.handlerMs ?? null) : null;
  base.preFrameValidatorMs =
    meanOf(repeatSegments.map((segment) => segment.preFrameMs)) ?? 0;
  base.postFrameValidatorMs =
    meanOf(repeatSegments.map((segment) => segment.postFrameMs)) ?? 0;
  base.validatorSettledMs = meanOf(
    repeats.map((write) => write.validatorSettledMs),
  );
  base.feedbackCommittedMs = meanOf(
    repeats.map((write) => write.feedbackCommittedMs),
  );
  for (const write of writes) base.feedbackClasses[write.feedbackClass]++;
  base.coalescedWrites = writes.filter((write) => write.coalesced).length;
  return { metrics: base, writes };
}
