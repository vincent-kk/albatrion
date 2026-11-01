import type {
  ValidationAfterPaintGate,
  ValidationAfterPaintPage,
  ValidationAfterPaintRow,
} from '../../validationAfterPaintTypes';
import type { SampleResult } from '../summarizeResults';
import type { bootstrapProcessingRatio } from './bootstrapProcessingRatio';

/** Confirmed violations fail; missing numeric evidence remains indeterminate. */
const status = (
  checks: (boolean | null)[],
): ValidationAfterPaintGate['status'] =>
  checks.includes(false)
    ? 'FAIL'
    : checks.includes(null)
      ? 'INDETERMINATE'
      : 'PASS';
/** Compare values without treating a missing statistic as zero. */
const atMost = (
  value: number | null | undefined,
  limit: number | null | undefined,
) => (value == null || limit == null ? null : value <= limit);

/** Apply only the pre-registered G1–G6 and G8 thresholds to complete row evidence.
 * @param ruleVersion - Explicit G8 guard; independent of available handler evidence. */
export function decideValidationAfterPaintGates(
  rows: ValidationAfterPaintRow[],
  ratios: Record<string, ReturnType<typeof bootstrapProcessingRatio>>,
  samples: SampleResult[],
  pages: Record<string, ValidationAfterPaintPage>,
  handlerRatios?: Record<string, ReturnType<typeof bootstrapProcessingRatio>>,
  ruleVersion?: 'round-6',
) {
  const find = (id: string, lane: string) =>
    rows.find((row) => row.id === id && row.lane === lane)!;
  const typing = rows.filter(
    (row) => row.lane === 'F' && row.id.startsWith('type-'),
  );
  const id = 'type-flat-2000-validate-nonburst';
  const legacy = find(id, 'L'),
    candidate = find(id, 'F');
  const lMedian = legacy.processing.median ?? legacy.handler.p95;
  const transferFactor =
    lMedian !== null && lMedian > 6.425 * 1.1
      ? Math.max(0.8, 6.425 / lMedian)
      : 1;
  const comparable = lMedian !== null && lMedian <= 6.425 * 1.25;
  const transferredP95 =
    candidate.processingP95 === null
      ? null
      : candidate.processingP95 * transferFactor;
  const g1 = {
    lMedian,
    lMedianSource:
      legacy.processing.median === null ? 'handler-p95' : 'event-median',
    fP95: candidate.processingP95,
    transferFactor,
    transferredP95,
    comparable,
    upperBound: ratios[id].upperBound,
  };
  const mount = ['mount-flat-500-validate', 'mount-nested-d5-f4-validate'];
  const stream = samples
    .filter(
      (sample) =>
        sample.id === 'stream-flat-2000-validate' && sample.lane === 'F',
    )
    .map((sample) => ({ index: sample.index, ...pages[sample.file].stream! }));
  const array = ['mount-array-1000-none', 'mount-array-1000-validate'];
  const gates: ValidationAfterPaintGate[] = [
    {
      id: 'G1',
      status: comparable
        ? status([
            atMost(transferredP95, 16.67),
            ratios[id].upperBound === null ? null : ratios[id].upperBound < 1,
          ])
        : 'INDETERMINATE',
      details: g1,
    },
    {
      id: 'G2',
      status: status(
        typing.map((row) =>
          atMost((handlerRatios ?? ratios)[row.id].upperBound, 1.1),
        ),
      ),
      details: handlerRatios
        ? {
            source: 'all-handlers',
            rows: handlerRatios,
            eventTimingReference: ratios,
          }
        : Object.fromEntries(typing.map((row) => [row.id, ratios[row.id]])),
    },
    {
      id: 'G3',
      status: status(
        typing.flatMap((row) => [
          row.frameSupported && find(row.id, 'E').frameSupported,
          atMost(
            row.durationP95,
            find(row.id, 'E').durationP95 === null
              ? null
              : find(row.id, 'E').durationP95! + 8,
          ),
          row.longFrameCount <= find(row.id, 'E').longFrameCount + 1,
        ]),
      ),
      details: typing.map((row) => ({
        id: row.id,
        F: row.durationP95,
        E: find(row.id, 'E').durationP95,
        framesF: row.longFrameCount,
        framesE: find(row.id, 'E').longFrameCount,
      })),
    },
    {
      id: 'G4',
      status: status(
        typing
          .filter((row) => row.id.endsWith('-nonburst'))
          .flatMap((row) => [
            atMost(row.validation.p95, 33.4),
            row.keys === 200 && row.undelivered === 0,
          ]),
      ),
      details: typing
        .filter((row) => row.id.endsWith('-nonburst'))
        .map((row) => ({
          id: row.id,
          arrivalP95: row.validation.p95,
          undelivered: row.undelivered,
          keys: row.keys,
        })),
    },
    {
      id: 'G5',
      status: status(
        mount.flatMap((name) => [
          atMost(
            find(name, 'F').firstPaintedMs.median,
            find(name, 'E').firstPaintedMs.median,
          ),
          atMost(
            find(name, 'F').mount.eagerPaintedMs.median,
            find(name, 'E').mount.eagerPaintedMs.median === null
              ? null
              : find(name, 'E').mount.eagerPaintedMs.median! + 16.7,
          ),
        ]),
      ),
      details: mount.map((name) => ({
        id: name,
        F: find(name, 'F').firstPaintedMs.median,
        E: find(name, 'E').firstPaintedMs.median,
      })),
    },
    {
      id: 'G6',
      status: status([
        ...stream.map(
          (page) => page.validationRuns <= 2 + Math.ceil(page.durationMs / 100),
        ),
        find('stream-flat-2000-validate', 'F').longFrameCount <=
          find('stream-flat-2000-validate', 'E').longFrameCount,
      ]),
      details: stream.map((page) => ({
        ...page,
        limit: 2 + Math.ceil(page.durationMs / 100),
      })),
    },
    {
      id: 'G8',
      status: status(
        array.flatMap((name) => [
          atMost(
            find(name, 'F').firstPaintedMs.median,
            find(name, 'E').firstPaintedMs.median === null
              ? null
              : find(name, 'E').firstPaintedMs.median! *
                  (name.endsWith('-none') ? 1.02 : 1),
          ),
          atMost(
            find(name, 'F').mount.eagerPaintedMs.median,
            find(name, 'E').mount.eagerPaintedMs.median === null
              ? null
              : ruleVersion === 'round-6'
                ? find(name, 'E').mount.eagerPaintedMs.median! + 8.35
                : find(name, 'E').mount.eagerPaintedMs.median! *
                  (name.endsWith('-none') ? 1.02 : 1),
          ),
        ]),
      ),
      details: array.map((name) => ({
        id: name,
        F: find(name, 'F').firstPaintedMs.median,
        E: find(name, 'E').firstPaintedMs.median,
      })),
    },
  ];
  return { gates, g1 };
}
