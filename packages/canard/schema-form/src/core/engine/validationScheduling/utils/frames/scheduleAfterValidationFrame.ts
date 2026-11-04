import { scheduleCancelableMacrotask } from '@winglet/common-utils/scheduler';

import { VALIDATION_FRAME_TIMEOUT_MS } from '../constants';
import { canScheduleValidationFrame } from './canScheduleValidationFrame';

/**
 * Race one after-frame task against the host's stalled-frame timeout.
 * @param run - Receives true when a fallback replaces normal frame scheduling.
 * @returns Cancellation of every frame, timer and task owned by this slot.
 */
export const scheduleAfterValidationFrame = (
  run: (fallback: boolean) => void,
): (() => void) => {
  if (!canScheduleValidationFrame())
    return scheduleCancelableMacrotask(() => run(true));
  let done = false;
  let cancelTask: (() => void) | undefined;
  const cancelFrame = cancelAnimationFrame;
  const cancel = () => {
    done = true;
    clearTimeout(timeout);
    cancelFrame(frame);
    cancelTask?.();
  };
  const finish = (fallback: boolean) => {
    if (done) return;
    cancel();
    run(fallback);
  };
  const timeout = setTimeout(() => finish(true), VALIDATION_FRAME_TIMEOUT_MS);
  const frame = requestAnimationFrame(() => {
    if (!done) cancelTask = scheduleCancelableMacrotask(() => finish(false));
  });
  return cancel;
};
