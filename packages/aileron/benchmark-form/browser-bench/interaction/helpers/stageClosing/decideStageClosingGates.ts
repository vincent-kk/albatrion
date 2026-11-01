import type {
  ClosingBound,
  StageClosingPage,
  StageClosingRow,
} from '../../stageClosingTypes';
import type { ValidationAfterPaintGate } from '../../validationAfterPaintTypes';
import type { SampleResult } from '../summarizeResults';
import { decideVsyncBound } from './decideVsyncBound';
import { REGISTERED_STAGE_CLOSING_RULES as rules } from './registeredStageClosingRules';

/** Failure dominates uncertainty; an empty or incomplete collection cannot pass. */
const status = (
  checks: (boolean | null)[],
): ValidationAfterPaintGate['status'] =>
  checks.includes(false)
    ? 'FAIL'
    : !checks.length || checks.includes(null)
      ? 'INDETERMINATE'
      : 'PASS';
/** Preserve absent numeric evidence instead of coercing it to zero. */
const atMost = (
  value: number | null | undefined,
  limit: number | null | undefined,
) => (value == null || limit == null ? null : value <= limit);

/** Apply C0–C7 to complete raw-derived rows; IR-6 decisions are supplied unchanged by the shared derivation. */
export function decideStageClosingGates(
  rows: StageClosingRow[],
  bounds: Record<string, Record<string, ClosingBound>>,
  ir6B: ValidationAfterPaintGate[],
  ir6S: ValidationAfterPaintGate[],
  samples: SampleResult[],
  pages: Record<string, StageClosingPage>,
): ValidationAfterPaintGate[] {
  const find = (id: string, lane: string) =>
    rows.find((row) => row.id === id && row.lane === lane);
  const typing = rows.filter(
    (row) => row.lane === 'F' && row.id.startsWith('type-'),
  );
  const mounts = rows.filter(
    (row) =>
      row.lane === 'F' &&
      row.id.startsWith('mount-') &&
      !row.id.endsWith('-none') &&
      !row.id.startsWith('mount-if-'),
  );
  const operations = rows.filter(
    (row) => row.lane === 'F' && /^(reset|rebuild|validate)-/.test(row.id),
  );
  const streams = samples
    .filter((s) => s.lane === 'F' && s.id === 'stream-flat-2000-validate')
    .map((s) => pages[s.file].stream);
  const c0 = ir6B.find((g) => g.id === 'G1');
  const streamF = find('stream-flat-2000-validate', 'F'),
    streamB = find('stream-flat-2000-validate', 'B');
  return [
    { id: 'C0', status: c0?.status ?? 'INDETERMINATE', details: c0?.details },
    {
      id: 'C1',
      status: status([
        typing.length === 8,
        ...typing.map((r) =>
          atMost(bounds[r.id]?.processing?.upperBound, rules.ratioLimit),
        ),
      ]),
      details: typing.map((r) => ({
        id: r.id,
        bound: bounds[r.id]?.processing,
      })),
    },
    {
      id: 'C2',
      status: status([
        typing.length === 8,
        ...typing.flatMap((r) => {
          const b = find(r.id, 'B');
          return [
            r.frameSupported && !!b?.frameSupported,
            atMost(
              r.durationP95,
              b?.durationP95 == null
                ? null
                : b.durationP95 + rules.durationAllowanceMs,
            ),
            atMost(
              r.longFrameCount,
              b ? b.longFrameCount + rules.frameAllowance : null,
            ),
          ];
        }),
      ]),
      details: typing.map((r) => ({
        id: r.id,
        F: { duration: r.durationP95, frames: r.longFrameCount },
        B: {
          duration: find(r.id, 'B')?.durationP95,
          frames: find(r.id, 'B')?.longFrameCount,
        },
      })),
    },
    {
      id: 'C3',
      status: status([
        typing.length === 8,
        ...typing
          .filter((r) => r.id.endsWith('-nonburst'))
          .flatMap((r) => [
            atMost(r.validation.p95, rules.arrivalLimitMs),
            r.keys === 200 && r.undelivered === 0,
          ]),
      ]),
      details: typing
        .filter((r) => r.id.endsWith('-nonburst'))
        .map((r) => ({
          id: r.id,
          arrival: r.validation.p95,
          keys: r.keys,
          undelivered: r.undelivered,
        })),
    },
    {
      id: 'C4',
      status: status([
        mounts.length === 5,
        ...mounts.flatMap((r) => [
          decideVsyncBound(bounds[r.id]?.firstPainted),
          decideVsyncBound(bounds[r.id]?.eagerPainted),
          r.frameSupported && !!find(r.id, 'B')?.frameSupported,
          atMost(
            r.longFrameCount,
            find(r.id, 'B')
              ? (find(r.id, 'B')?.longFrameCount ?? 0) + rules.frameAllowance
              : null,
          ),
        ]),
      ]),
      details: mounts.map((r) => ({
        id: r.id,
        bounds: bounds[r.id],
        framesF: r.longFrameCount,
        framesB: find(r.id, 'B')?.longFrameCount,
      })),
    },
    {
      id: 'C5',
      status: status([
        operations.length === 4,
        ...operations.flatMap((r) => [
          atMost(
            bounds[r.id]?.[
              r.id.startsWith('validate-') ? 'resolutionTime' : 'callDuration'
            ]?.upperBound,
            rules.ratioLimit,
          ),
          ...(r.id.startsWith('validate-')
            ? []
            : [decideVsyncBound(bounds[r.id]?.nextPainted)]),
          r.frameSupported && !!find(r.id, 'B')?.frameSupported,
          atMost(
            r.longFrameCount,
            find(r.id, 'B')
              ? (find(r.id, 'B')?.longFrameCount ?? 0) + rules.frameAllowance
              : null,
          ),
        ]),
      ]),
      details: operations.map((r) => ({
        id: r.id,
        bounds: bounds[r.id],
        framesF: r.longFrameCount,
        framesB: find(r.id, 'B')?.longFrameCount,
      })),
    },
    {
      id: 'C6',
      status: status([
        streams.length === rules.pages,
        ...streams.map((s) =>
          s ? s.validationRuns <= 2 + Math.ceil(s.durationMs / 100) : null,
        ),
        !!streamF?.frameSupported && !!streamB?.frameSupported,
        atMost(streamF?.longFrameCount, streamB?.longFrameCount),
      ]),
      details: streams,
    },
    {
      id: 'C7',
      status: status([
        ir6S.length === 7,
        ...ir6S.map((g) =>
          g.status === 'INDETERMINATE' ? null : g.status === 'PASS',
        ),
      ]),
      details: ir6S,
    },
  ];
}
