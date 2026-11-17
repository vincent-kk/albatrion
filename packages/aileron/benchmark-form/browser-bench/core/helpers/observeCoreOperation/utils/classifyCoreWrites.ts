import type {
  CoreInputRecord,
  CoreMarkerTransition,
  CoreValidatorRecord,
  CoreWriteMetrics,
} from '../../../types';
import { expectCoreMarkerState } from './expectCoreMarkerState';

/** Marker state in force at a clock reading, from the start state and earlier transitions. */
const stateAt = (
  transitions: readonly CoreMarkerTransition[],
  stateAtStart: '0' | '1' | null,
  atMs: number,
) => {
  let state = stateAtStart;
  for (const transition of transitions)
    if (transition.atMs <= atMs) state = transition.state;
  return state;
};

/**
 * Attribute validator runs and marker transitions to writes by value and time window.
 * @param writes - Trusted input records in capture order; each `durationMs` is the handler cost.
 * @param records - Validator records whose `probeValue` identifies the validated value; unsettled runs count as absent.
 * @param transitions - Marker transitions in DOM order.
 * @param stateAtStart - Marker state before the first write; null when no marker existed.
 * @param endMs - Window end bounding the last write's feedback.
 * @returns One entry per write: exact (transition to the expected state before the next capture), censored (none before it), noChange (validated while the marker already showed the expected state), superseded (never validated).
 */
export function classifyCoreWrites(
  writes: readonly CoreInputRecord[],
  records: readonly CoreValidatorRecord[],
  transitions: readonly CoreMarkerTransition[],
  stateAtStart: '0' | '1' | null,
  endMs: number,
): CoreWriteMetrics[] {
  return writes.map((write, index) => {
    const bound = writes[index + 1]?.start ?? endMs;
    const expected = expectCoreMarkerState(write.value);
    const run = records.find(
      (record) =>
        record.kind === 'run' &&
        record.probeValue === write.value &&
        record.startMs >= write.start &&
        record.settledMs >= record.startMs,
    );
    const transition = transitions.find(
      (candidate) =>
        candidate.atMs >= write.start &&
        candidate.atMs < bound &&
        candidate.state === expected,
    );
    const feedbackClass: CoreWriteMetrics['feedbackClass'] = !run
      ? 'superseded'
      : transition
        ? 'exact'
        : stateAt(transitions, stateAtStart, write.start) === expected
          ? 'noChange'
          : 'censored';
    return {
      index: index + 1,
      value: write.value,
      handlerMs: write.durationMs ?? 0,
      validatorSettledMs: run ? run.settledMs - write.start : null,
      feedbackCommittedMs:
        run && transition ? transition.atMs - write.start : null,
      feedbackClass,
      coalesced: Boolean(run && run.startMs > bound),
    };
  });
}
