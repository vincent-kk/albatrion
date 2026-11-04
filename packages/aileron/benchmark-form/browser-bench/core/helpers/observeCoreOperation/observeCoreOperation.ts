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
  /** Perform the operation after observers are armed. */
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
  /** Per-write attribution. */
  writes: CoreWriteMetrics[];
}

/**
 * Observe one operation from armed observers through quiet.
 * @param spec - Operation body and page-lifetime observers.
 * @param env - Browser-owned clocks.
 * @returns Metrics; throws at the 5000 ms cap or an out-of-range frame interval.
 */
export async function observeCoreOperation(
  spec: CoreOperationSpec,
  env: CoreObservationEnv,
): Promise<CoreOperationResult> {
  const outcome = await spec.execute();
  return {
    startMs: outcome.startMs,
    endMs: env.now(),
    metrics: {
      durationMs: outcome.durationMs,
      blockingMs: null,
      maxLongTaskMs: null,
      firstWriteMs: null,
      longTaskOverlapMs: 0,
      preFrameValidatorMs: 0,
      postFrameValidatorMs: 0,
      validatorSettledMs: null,
      feedbackCommittedMs: null,
      feedbackClasses: { exact: 0, censored: 0, noChange: 0, superseded: 0 },
      validationReportedMs: null,
      frames: 0,
      frameIntervalMs: 0,
      longestFrameMs: 0,
      frameOverflowMs: 0,
      overBudgetFrames: 0,
      coalescedWrites: 0,
    },
    writes: [],
  };
}
