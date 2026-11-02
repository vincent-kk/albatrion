import { bootstrapStageClosingMetric } from '../stageClosing/bootstrapStageClosingMetric';
import { quantile } from '../validationAfterPaint/quantile';
import type { StateVocabularyReport } from './reportTypes';

/** Summarize absolute getter timings and B/F retained heap; neither produces a blocking verdict. */
export function deriveStateVocabularyReports(reports: StateVocabularyReport[]) {
  const reads = reports.flatMap((r) =>
    r.read?.status === 'ran' ? [r.read] : [],
  );
  const before = reports
    .filter((r) => r.lane === 'B' && r.heap)
    .sort((a, b) => a.index - b.index);
  const after = reports
    .filter((r) => r.lane === 'F' && r.heap)
    .sort((a, b) => a.index - b.index);
  const heap = ['B', 'F'].map((lane) => ({
    lane,
    usedSize: quantile(
      reports.filter((r) => r.lane === lane).map((r) => r.heap?.usedSize),
    ),
    totalSize: quantile(
      reports.filter((r) => r.lane === lane).map((r) => r.heap?.totalSize),
    ),
  }));
  return {
    isDivergent: {
      ran: reads.length,
      skipped: reports.filter((r) => r.read?.status === 'skipped').length,
      firstMs: {
        median: quantile(reads.map((r) => r.firstMs)),
        p95: quantile(
          reads.map((r) => r.firstMs),
          0.95,
        ),
      },
      repeatedMs: {
        median: quantile(reads.map((r) => r.repeatedMs)),
        p95: quantile(
          reads.map((r) => r.repeatedMs),
          0.95,
        ),
      },
    },
    heap: {
      unit: 'bytes',
      rows: heap,
      comparison: bootstrapStageClosingMetric(
        before.map((r) => r.heap?.usedSize ?? null),
        after.map((r) => r.heap?.usedSize ?? null),
      ),
    },
  };
}
