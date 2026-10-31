import { scheduleCancelableMacrotask } from '@winglet/common-utils/scheduler';

/**
 * Schedule validation after the next rendering update, with a stalled-frame fallback.
 * The host owns frame support and visibility, so both are read on every call.
 * @param run - Validation work to execute exactly once after the selected slot.
 * @returns Nothing; the winning branch cancels the remaining scheduled handles.
 */
export const scheduleValidationSlot = (run: () => void): void => {
  if (
    typeof requestAnimationFrame !== 'function' ||
    (typeof document !== 'undefined' && document.hidden)
  ) {
    scheduleCancelableMacrotask(run);
    return;
  }
  let done = false;
  let cancelTask: (() => void) | undefined;
  const cancelFrame = cancelAnimationFrame;
  const finish = () => {
    if (done) return;
    done = true;
    clearTimeout(timeout);
    cancelFrame(frame);
    cancelTask?.();
    run();
  };
  const timeout = setTimeout(finish, 100);
  const frame = requestAnimationFrame(() => {
    if (!done) cancelTask = scheduleCancelableMacrotask(finish);
  });
};
