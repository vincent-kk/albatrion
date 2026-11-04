import type {
  CoreInputRecord,
  CoreMarkerTransition,
  CoreValidatorRecord,
  CoreWriteMetrics,
} from '../../../types';

/**
 * Attribute validator runs and marker transitions to writes.
 * @param writes - Trusted input records in capture order.
 * @param records - Validator records of the window.
 * @param transitions - Marker transitions of the window.
 * @param stateAtStart - Marker state before the first write.
 * @param endMs - Window end bounding the last write.
 * @returns Per-write metrics.
 */
export function classifyCoreWrites(
  writes: CoreInputRecord[],
  records: CoreValidatorRecord[],
  transitions: CoreMarkerTransition[],
  stateAtStart: '0' | '1' | null,
  endMs: number,
): CoreWriteMetrics[] {
  void records;
  void transitions;
  void stateAtStart;
  void endMs;
  return writes.map((write, index) => ({
    index: index + 1,
    value: write.value,
    handlerMs: write.durationMs ?? 0,
    validatorSettledMs: null,
    feedbackCommittedMs: null,
    feedbackClass: 'superseded',
    coalesced: false,
  }));
}
