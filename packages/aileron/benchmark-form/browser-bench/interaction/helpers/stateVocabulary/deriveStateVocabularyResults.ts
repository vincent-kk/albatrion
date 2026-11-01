import type {
  ClosingBound,
  StageClosingPage,
  StageClosingRow,
} from '../../stageClosingTypes';
import { bootstrapStageClosingMetric } from '../stageClosing/bootstrapStageClosingMetric';
import { deriveStageClosingValidatorWork } from '../stageClosing/deriveStageClosingValidatorWork';
import { readStageClosingDiagnosis } from '../stageClosing/readStageClosingDiagnosis';
import { readStageClosingFrameDiagnosis } from '../stageClosing/readStageClosingFrameDiagnosis';
import { readStageClosingMetrics } from '../stageClosing/readStageClosingMetrics';
import { readStageClosingPositionCounts } from '../stageClosing/readStageClosingPositionCounts';
import { summarizePage } from '../summarizePage';
import type { SampleResult } from '../summarizeResults';
import { summarizeResults } from '../summarizeResults';
import { bootstrapProcessingRatio } from '../validationAfterPaint/bootstrapProcessingRatio';
import { quantile } from '../validationAfterPaint/quantile';
import { readInteractionMetrics } from '../validationAfterPaint/readInteractionMetrics';
import { bootstrapPooledHandlerDifference } from './bootstrapPooledHandlerDifference';
import { decideStateVocabularyGates } from './decideStateVocabularyGates';
import { deriveStateVocabularyValidatorWork } from './deriveStateVocabularyValidatorWork';
import { REGISTERED_STATE_VOCABULARY_RULES as rules } from './registeredStateVocabularyRules';

/** Recompute B/F timing decisions from raw closing pages under the state-vocabulary rules. */
export function deriveStateVocabularyResults(
  samples: SampleResult[],
  pages: Record<string, StageClosingPage>,
) {
  const canonical = samples.map((sample) => ({
    ...sample,
    summary: summarizePage(pages[sample.file]),
  }));
  const group = (id: string, lane: string) =>
    canonical
      .filter((s) => s.id === id && s.lane === lane)
      .sort((a, b) => a.index - b.index)
      .map((s) => pages[s.file]);
  const rows: StageClosingRow[] = summarizeResults(canonical).map((row) => {
    const raw = group(row.id, row.lane),
      metrics = raw.map((p) => readStageClosingMetrics(p));
    return {
      ...row,
      keys: raw.reduce((sum, p) => sum + p.handlers.length, 0),
      processingSource: row.processing.p95 === null ? 'handler' : 'event',
      durationSource: row.total.p95 === null ? 'handler' : 'event',
      processingP95: row.processing.p95 ?? row.handler.p95,
      durationP95: row.total.p95 ?? row.handler.p95,
      firstPaintedMs: {
        median: quantile(raw.map((p) => p.mount.firstPaintedMs)),
        p95: quantile(
          raw.map((p) => p.mount.firstPaintedMs),
          0.95,
        ),
      },
      inputDelay: {
        median: quantile(
          raw.map((p) => quantile(readInteractionMetrics(p).inputDelay)),
        ),
        p95: quantile(
          raw.map((p) => quantile(readInteractionMetrics(p).inputDelay, 0.95)),
          0.95,
        ),
        observations: raw.reduce(
          (count, p) => count + readInteractionMetrics(p).inputDelay.length,
          0,
        ),
      },
      metrics: Object.fromEntries(
        Object.keys(metrics[0] ?? {}).map((key) => [
          key,
          quantile(metrics.map((m) => m[key])),
        ]),
      ),
      firstOperation: Object.fromEntries(
        Object.keys(metrics[0] ?? {}).map((key) => [
          key,
          quantile(raw.map((p) => readStageClosingMetrics(p, true)[key])),
        ]),
      ),
      legacyReset: raw.some((p) => p.closing.legacyReset),
      longFrameCount: raw.some((p) => p.closing.operations.length)
        ? raw.reduce(
            (sum, p) =>
              sum +
              p.closing.operations.reduce((n, op) => n + op.longFrameCount, 0),
            0,
          )
        : row.longFrameCount,
    };
  });
  const comparisons: Record<
    string,
    Record<string, Record<string, ClosingBound>>
  > = {};
  for (const reference of ['B']) {
    comparisons[reference] = {};
    for (const row of rows.filter((r) => r.lane === 'F')) {
      const before = group(row.id, reference),
        after = group(row.id, 'F');
      if (!before.length) continue;
      const a = before.map((p) => readStageClosingMetrics(p)),
        b = after.map((p) => readStageClosingMetrics(p));
      const bounds = Object.fromEntries(
        Object.keys(row.metrics).map((key) => [
          key,
          bootstrapStageClosingMetric(
            a.map((m) => m[key]),
            b.map((m) => m[key]),
          ),
        ]),
      );
      if (row.id.startsWith('mount-')) {
        bounds.flooredMountLongestFrame = bootstrapStageClosingMetric(
          a.map((m) =>
            m.longestFrame === null
              ? null
              : Math.max(m.longestFrame, rules.mountFrameFloorMs),
          ),
          b.map((m) =>
            m.longestFrame === null
              ? null
              : Math.max(m.longestFrame, rules.mountFrameFloorMs),
          ),
          rules.seed,
          rules.resamples,
        );
      }
      if (row.id.startsWith('type-') || row.id.startsWith('first-key-')) {
        const processing = bootstrapProcessingRatio(
          before.map(readInteractionMetrics),
          after.map(readInteractionMetrics),
          rules.seed,
          rules.resamples,
          'handler',
        );
        bounds.processing = {
          upperBound: processing.upperBound,
          differenceUpperBound: bootstrapStageClosingMetric(
            before.map((p) => quantile(readInteractionMetrics(p).handler)),
            after.map((p) => quantile(readInteractionMetrics(p).handler)),
            rules.seed,
            rules.resamples,
          ).differenceUpperBound,
          undefinedRatios: processing.undefinedRatios,
        };
      }
      if (row.id.startsWith('type-')) {
        bounds.processingTail = {
          upperBound: bounds.processing.upperBound,
          differenceUpperBound: bootstrapPooledHandlerDifference(
            before.map(readInteractionMetrics),
            after.map(readInteractionMetrics),
            rules.seed,
            rules.resamples,
          ),
          undefinedRatios: bounds.processing.undefinedRatios,
        };
      }
      comparisons[reference][row.id] = bounds;
    }
  }
  const gates = decideStateVocabularyGates(
    rows,
    comparisons.B,
    canonical,
    pages,
  );
  const validatorWork = deriveStateVocabularyValidatorWork(canonical, pages);
  const zeroMetrics = Object.fromEntries(
    rows
      .filter((row) => row.lane === 'F')
      .map((row) => [
        row.id,
        Object.keys(row.metrics).filter((metric) =>
          [...group(row.id, 'B'), ...group(row.id, 'F')].every(
            (page) => readStageClosingMetrics(page)[metric] === 0,
          ),
        ),
      ]),
  );
  const diagnosis = [
    ...readStageClosingDiagnosis(comparisons.B, zeroMetrics),
    ...readStageClosingFrameDiagnosis(
      deriveStageClosingValidatorWork(canonical, pages).rows,
    ),
  ];
  return {
    ruleVersion: rules.version,
    rows,
    comparisons,
    gates,
    c0: {
      status: 'NOT_APPLICABLE',
      reason:
        'C0 requires public L calibration; the approved window has B/F only.',
    },
    sv1: {
      id: 'SV-1',
      status: gates.some((g) => g.status === 'FAIL')
        ? 'FAIL'
        : gates.some((g) => g.status === 'INDETERMINATE')
          ? 'INDETERMINATE'
          : 'PASS',
    },
    diagnosis,
    validatorWork,
    rotation: readStageClosingPositionCounts(canonical),
  };
}
