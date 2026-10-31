import type {
  ValidationAfterPaintPage,
  ValidationAfterPaintRow,
} from '../validationAfterPaintTypes';
import { summarizePage } from './summarizePage';
import type { SampleResult } from './summarizeResults';
import { summarizeResults } from './summarizeResults';
import { bootstrapProcessingRatio } from './validationAfterPaint/bootstrapProcessingRatio';
import { decideValidationAfterPaintGates } from './validationAfterPaint/decideValidationAfterPaintGates';
import { quantile } from './validationAfterPaint/quantile';
import { readInteractionMetrics } from './validationAfterPaint/readInteractionMetrics';

/** Derive stage tables and mechanical gates from canonical retained pages.
 * @param samples - Retained page identities and paired lane indices.
 * @param mode - Quiet or provisional paired-relative collection.
 * @param pages - Raw measurements keyed by the retained sample file.
 * @param ruleVersion - Registered round-6 rules; omitted preserves the first window exactly.
 * @returns Raw-derived comparisons and decisions, including original-rule references for round 6. */
export function deriveValidationAfterPaintResults(
  samples: SampleResult[],
  mode: string,
  pages: Record<string, ValidationAfterPaintPage>,
  ruleVersion?: 'round-6',
) {
  const canonical = samples.map((sample) => ({
    ...sample,
    summary: summarizePage(pages[sample.file]),
  }));
  const rows: ValidationAfterPaintRow[] = summarizeResults(canonical).map(
    (row) => {
      const group = canonical.filter(
        (sample) => sample.id === row.id && sample.lane === row.lane,
      );
      const delays = group.map(
        (sample) => readInteractionMetrics(pages[sample.file]).inputDelay,
      );
      return {
        ...row,
        keys: group.reduce(
          (count, sample) => count + pages[sample.file].handlers.length,
          0,
        ),
        processingSource: row.processing.p95 === null ? 'handler' : 'event',
        durationSource: row.total.p95 === null ? 'handler' : 'event',
        processingP95: row.processing.p95 ?? row.handler.p95,
        durationP95: row.total.p95 ?? row.handler.p95,
        firstPaintedMs: {
          median: quantile(
            group.map((sample) => sample.summary.mount.firstPaintedMs),
          ),
          p95: quantile(
            group.map((sample) => sample.summary.mount.firstPaintedMs),
            0.95,
          ),
        },
        inputDelay: {
          median: quantile(delays.map((values) => quantile(values))),
          p95: quantile(
            delays.map((values) => quantile(values, 0.95)),
            0.95,
          ),
          observations: delays.reduce(
            (count, values) => count + values.length,
            0,
          ),
        },
      };
    },
  );
  const handlerRatios: Record<
    string,
    ReturnType<typeof bootstrapProcessingRatio>
  > = {};
  const handlerEvidence: Record<
    string,
    {
      E: { keys: number; p95: number | null; eventP95: number | null };
      F: { keys: number; p95: number | null; eventP95: number | null };
    }
  > = {};
  const ratios = Object.fromEntries(
    rows
      .filter((row) => row.lane === 'F' && row.id.startsWith('type-'))
      .map((row) => {
        const group = (lane: string) =>
          canonical
            .filter((sample) => sample.id === row.id && sample.lane === lane)
            .sort((a, b) => a.index - b.index)
            .map((sample) => readInteractionMetrics(pages[sample.file]));
        const before = group('E'),
          after = group('F');
        if (ruleVersion) {
          handlerRatios[row.id] = bootstrapProcessingRatio(
            before,
            after,
            20261031,
            10000,
            'handler',
          );
          const evidence = (entries: typeof before) => ({
            keys: entries.reduce(
              (count, entry) => count + entry.handler.length,
              0,
            ),
            p95: quantile(
              entries.flatMap((entry) => entry.handler),
              0.95,
            ),
            eventP95: quantile(
              entries.flatMap((entry) => entry.processing),
              0.95,
            ),
          });
          handlerEvidence[row.id] = { E: evidence(before), F: evidence(after) };
        }
        return [row.id, bootstrapProcessingRatio(before, after)];
      }),
  );
  const { gates, g1 } = decideValidationAfterPaintGates(
    rows,
    ratios,
    canonical,
    pages,
    ruleVersion ? handlerRatios : undefined,
  );
  const ownerGoals = rows
    .filter((row) => row.lane === 'F' && row.id.startsWith('type-'))
    .map((row) => {
      const legacy = rows.find(
        (other) => other.id === row.id && other.lane === 'L',
      )!;
      const compare = (value: number | null, before: number | null) =>
        value === null || before === null ? null : value <= before;
      return {
        id: row.id,
        processing: compare(row.processingP95, legacy.processingP95),
        duration: compare(row.durationP95, legacy.durationP95),
        arrival: compare(row.validation.p95, legacy.validation.p95),
      };
    });
  const streams = canonical
    .filter((sample) => sample.id.startsWith('stream-'))
    .map((sample) => ({
      lane: sample.lane,
      index: sample.index,
      ...pages[sample.file].stream!,
      scriptP95: quantile(pages[sample.file].stream!.scriptMs, 0.95),
    }));
  return {
    ...(ruleVersion
      ? {
          ruleVersion,
          handlerEvidence,
          handlerBootstrap: handlerRatios,
          originalGates: decideValidationAfterPaintGates(
            rows,
            ratios,
            canonical,
            pages,
          ).gates,
        }
      : {}),
    streams,
    mode,
    provisional: mode === 'paired-relative',
    rows,
    gates,
    g1,
    ownerGoals,
    bootstrap: {
      seed: 20261031,
      resamples: 10000,
      jointPageIndices: true,
      rows: ratios,
    },
  };
}
