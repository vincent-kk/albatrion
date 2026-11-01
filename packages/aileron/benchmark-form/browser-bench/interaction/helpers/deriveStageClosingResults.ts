import type {
  ClosingBound,
  StageClosingPage,
  StageClosingRow,
} from '../stageClosingTypes';
import { bootstrapStageClosingMetric } from './stageClosing/bootstrapStageClosingMetric';
import { decideStageClosingGates } from './stageClosing/decideStageClosingGates';
import { deriveStageClosingReference } from './stageClosing/deriveStageClosingReference';
import { deriveStageClosingValidatorWork } from './stageClosing/deriveStageClosingValidatorWork';
import { readStageClosingDiagnosis } from './stageClosing/readStageClosingDiagnosis';
import { readStageClosingFrameDiagnosis } from './stageClosing/readStageClosingFrameDiagnosis';
import { readStageClosingMetrics } from './stageClosing/readStageClosingMetrics';
import { readStageClosingPositionCounts } from './stageClosing/readStageClosingPositionCounts';
import { REGISTERED_STAGE_CLOSING_RULES as rules } from './stageClosing/registeredStageClosingRules';
import { summarizePage } from './summarizePage';
import type { SampleResult } from './summarizeResults';
import { summarizeResults } from './summarizeResults';
import { bootstrapProcessingRatio } from './validationAfterPaint/bootstrapProcessingRatio';
import { quantile } from './validationAfterPaint/quantile';
import { readInteractionMetrics } from './validationAfterPaint/readInteractionMetrics';

/** Derive every closing verdict and report-only F/B, F/S, F/L metric from retained pages. */
export function deriveStageClosingResults(
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
  const base = deriveStageClosingReference(canonical, pages, 'B'),
    stage = deriveStageClosingReference(canonical, pages, 'S');
  const rows: StageClosingRow[] = summarizeResults(canonical).map((row) => {
    const raw = group(row.id, row.lane),
      metrics = raw.map((p) => readStageClosingMetrics(p));
    const original = (row.lane === 'S' ? stage : base).rows.find(
      (r) =>
        r.id === row.id &&
        r.lane === (row.lane === 'B' || row.lane === 'S' ? 'E' : row.lane),
    );
    return {
      ...row,
      keys: raw.reduce((sum, p) => sum + p.handlers.length, 0),
      processingSource:
        original?.processingSource ??
        (row.processing.p95 === null ? 'handler' : 'event'),
      durationSource:
        original?.durationSource ??
        (row.total.p95 === null ? 'handler' : 'event'),
      processingP95:
        original?.processingP95 ?? row.processing.p95 ?? row.handler.p95,
      durationP95: original?.durationP95 ?? row.total.p95 ?? row.handler.p95,
      firstPaintedMs: {
        median: quantile(raw.map((p) => p.mount.firstPaintedMs)),
        p95: quantile(
          raw.map((p) => p.mount.firstPaintedMs),
          0.95,
        ),
      },
      inputDelay: original?.inputDelay ?? {
        median: null,
        p95: null,
        observations: 0,
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
  for (const reference of ['B', 'S', 'L']) {
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
          differenceUpperBound: null,
          undefinedRatios: processing.undefinedRatios,
        };
      }
      comparisons[reference][row.id] = bounds;
    }
  }
  const gates = decideStageClosingGates(
    rows,
    comparisons.B,
    base.gates,
    stage.gates,
    canonical,
    pages,
  );
  const validatorWork = deriveStageClosingValidatorWork(canonical, pages);
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
    ...readStageClosingFrameDiagnosis(validatorWork.rows),
  ];
  return {
    ruleVersion: rules.version,
    rows,
    comparisons,
    gates,
    c7: stage.gates,
    c0: base.g1,
    d8: {
      status: 'CLOSED_BY_TRACE',
      reason:
        'Payload omission also requires no runtime listeners; every mounted field subscribes, so revisionObserved cannot affect React form payload omission.',
    },
    diagnosis,
    validatorWork,
    rotation: readStageClosingPositionCounts(canonical),
  };
}
