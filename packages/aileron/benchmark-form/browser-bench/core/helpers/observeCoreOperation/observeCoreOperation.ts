// Browser-owned clocks: rAF, timers and the clock arrive through `env`; nothing here reads globals.
import type { CoreFixture } from '../../../../fixtures/core/types';
import type {
  CoreInputRecord,
  CoreLongTaskSource,
  CoreMarkerObservation,
  CoreMetrics,
  CoreObservationEnv,
  CoreValidationReport,
  CoreValidatorObservation,
  CoreWriteMetrics,
} from '../../types';
import { detectCoreFrameIntervalNominal } from '../detectCoreFrameIntervalNominal';
import { observeCoreFrames } from '../observeCoreFrames';
import { observeCoreLongTasks } from '../observeCoreLongTasks';
import { awaitCoreSettled } from './utils/awaitCoreSettled';
import { computeCoreMetrics } from './utils/computeCoreMetrics';
import { expectCoreMarkerState } from './utils/expectCoreMarkerState';

/** What the operation body reports back once its driver work is done. */
export interface CoreOperationOutcome {
  /** Start mark on the page clock. */
  startMs: number;
  /** Existing elapsed metric of the operation. */
  durationMs: number;
  /** Trusted input records for typing and first-key; empty otherwise. */
  writes: CoreInputRecord[];
}

/** One operation's observation inputs. */
export interface CoreOperationSpec {
  /** Measured public operation. */
  operation: CoreFixture['operation'];
  /** Whether validation is enabled; none cases skip validator and marker conditions. */
  validation: boolean;
  /** Probe default for validated loads; null for typing (last write) and none. */
  loadValue: string | null;
  /** Page-lifetime validator records. */
  validator: CoreValidatorObservation;
  /** Marker DOM evidence. */
  marker: CoreMarkerObservation;
  /** onValidate reports collected by the page. */
  reports: CoreValidationReport[];
  /** Long Task delivery. */
  longTasks: CoreLongTaskSource;
  /** Perform the operation after observers are armed and the frame interval is calibrated. */
  execute(): Promise<CoreOperationOutcome>;
}

/** Observation result for one operation. */
export interface CoreOperationResult {
  /** Start mark. */
  startMs: number;
  /** Quiet completion time; the observation window end. */
  endMs: number;
  /** Computed metrics. */
  metrics: CoreMetrics;
  /** Per-write attribution for typing and first-key. */
  writes: CoreWriteMetrics[];
}

/** Whole-observation cap, independent of frames. */
const CAP_MS = 5000;
/** Empty rAF gaps measured before the operation. */
const CALIBRATION_GAPS = 10;

/** Median of a nonempty list. */
const medianOf = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};

/**
 * Observe one operation: arm frame, Long Task and marker evidence, calibrate, run the body, wait for quiet, compute metrics.
 * @param spec - Operation body and page-lifetime observers.
 * @param env - Browser-owned clocks.
 * @returns Metrics and per-write attribution; rejects when the 5000 ms cap passes or the calibrated frame interval is not nominal (60 Hz or 120 Hz ± 3 ms).
 */
export async function observeCoreOperation(
  spec: CoreOperationSpec,
  env: CoreObservationEnv,
): Promise<CoreOperationResult> {
  let finished = false;
  const cap = new Promise<never>((_, reject) =>
    env.setTimeout(() => {
      if (!finished)
        reject(new Error(`Core observation exceeded ${CAP_MS} ms cap`));
    }, CAP_MS),
  );
  cap.catch(() => {});
  const frames = observeCoreFrames(env);
  const longTasks = observeCoreLongTasks(spec.longTasks, env);
  try {
    const calibration: number[] = [];
    for (let index = 0; index <= CALIBRATION_GAPS; index++)
      calibration.push(await Promise.race([frames.nextFrame(), cap]));
    const frameIntervalMs = medianOf(
      calibration.slice(1).map((at, index) => at - calibration[index]),
    );
    const frameIntervalNominalMs =
      detectCoreFrameIntervalNominal(frameIntervalMs);
    if (frameIntervalNominalMs === null)
      throw new Error(
        `Core frame interval ${frameIntervalMs.toFixed(2)} ms is not within 3 ms of a 60 Hz or 120 Hz period`,
      );
    const markerStateAtStart = spec.marker.state();
    const outcome = await Promise.race([spec.execute(), cap]);
    const lastValue = outcome.writes[outcome.writes.length - 1]?.value;
    const expectedValue = lastValue ?? spec.loadValue;
    const expectedState =
      lastValue !== undefined ? expectCoreMarkerState(lastValue) : '1';
    const endMs = await awaitCoreSettled(
      {
        holds: () =>
          spec.validator.pending.size === 0 &&
          (!spec.validation ||
            (spec.marker.state() === expectedState &&
              spec.validator.records.some(
                (record) =>
                  record.kind === 'run' &&
                  record.startMs >= outcome.startMs &&
                  record.probeValue === expectedValue &&
                  !spec.validator.pending.has(record),
              ))),
        activity: () =>
          spec.validator.records.length + spec.marker.transitions.length,
      },
      env,
      frames,
      cap,
    );
    const summary = await longTasks.finish(outcome.startMs, endMs);
    const computed = computeCoreMetrics({
      operation: spec.operation,
      validation: spec.validation,
      loadValue: spec.loadValue,
      startMs: outcome.startMs,
      endMs,
      durationMs: outcome.durationMs,
      frameIntervalMs,
      frameIntervalNominalMs,
      stamps: frames.stamps,
      records: spec.validator.records,
      writes: outcome.writes,
      transitions: spec.marker.transitions,
      markerStateAtStart,
      reports: spec.reports,
      longTasks: summary,
    });
    return { startMs: outcome.startMs, endMs, ...computed };
  } finally {
    finished = true;
    frames.stop();
  }
}
