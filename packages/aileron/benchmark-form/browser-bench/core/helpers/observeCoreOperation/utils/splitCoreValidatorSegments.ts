import type { CoreValidatorRecord } from '../../../types';

/** Synchronous validator time before and after the first frame of a window. */
export interface CoreValidatorSegments {
  /** Sum of synchronous segments of calls started before the first rAF after the window start. */
  preFrameMs: number;
  /** Sum of synchronous segments of calls started at or after that rAF. */
  postFrameMs: number;
}

/**
 * Split synchronous validator segments (compile, and the run part before its promise returns) by the first frame.
 * @param records - Validator records; only calls started in [startMs, endMs) count.
 * @param startMs - Window start.
 * @param endMs - Window end (exclusive).
 * @param firstFrameMs - First rAF clock reading after startMs; null when no frame came, which makes every call pre-frame.
 * @returns Pre- and post-frame sums in milliseconds.
 */
export function splitCoreValidatorSegments(
  records: readonly CoreValidatorRecord[],
  startMs: number,
  endMs: number,
  firstFrameMs: number | null,
): CoreValidatorSegments {
  const segments = { preFrameMs: 0, postFrameMs: 0 };
  for (const record of records) {
    if (record.startMs < startMs || record.startMs >= endMs) continue;
    const length = record.syncReturnMs - record.startMs;
    if (firstFrameMs === null || record.startMs < firstFrameMs)
      segments.preFrameMs += length;
    else segments.postFrameMs += length;
  }
  return segments;
}
