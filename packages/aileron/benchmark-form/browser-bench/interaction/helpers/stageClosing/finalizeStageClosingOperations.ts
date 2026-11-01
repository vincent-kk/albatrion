import type { ClosingOperation, ValidatorWork } from '../../stageClosingTypes';
import type { Entry } from '../../types';
import { readPostPaintBusy } from './readPostPaintBusy';

/** Recompute windows after observers drain so late LoAF delivery cannot disappear from a page median. */
export function finalizeStageClosingOperations(
  operations: ClosingOperation[],
  frames: Entry[],
  work: ValidatorWork[],
) {
  return operations.map((op) => {
    const relevant = frames.filter(
      (frame) =>
        frame.startTime < op.end && frame.startTime + frame.duration > op.start,
    );
    return {
      ...op,
      longestFrame: Math.max(0, ...relevant.map((frame) => frame.duration)),
      longFrameCount: relevant.filter((frame) => frame.duration >= 50).length,
      postPaintBusy: readPostPaintBusy(frames, work, op.paintBoundary, op.end),
    };
  });
}
