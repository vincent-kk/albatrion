import type { ValidatorWork } from '../../stageClosingTypes';
import type { Entry } from '../../types';

/** Clip post-paint frame and plugin work to the same operation deadline; overlapping work is additive by registration. */
export function readPostPaintBusy(
  frames: Entry[],
  work: ValidatorWork[],
  firstPaint: number,
  deadline: number,
) {
  return (
    frames
      .filter(
        (frame) => frame.startTime >= firstPaint && frame.startTime < deadline,
      )
      .reduce(
        (sum, frame) =>
          sum +
          Math.max(
            0,
            Math.min(frame.startTime + frame.duration, deadline) -
              frame.startTime,
          ),
        0,
      ) +
    work
      .filter((entry) => entry.start >= firstPaint && entry.start < deadline)
      .reduce(
        (sum, entry) =>
          sum + Math.max(0, Math.min(entry.end, deadline) - entry.start),
        0,
      )
  );
}
