import { VALIDATION_FRAME_TIMEOUT_MS } from '../constants';

/**
 * Observe one frame, falling back if the host never invokes it.
 * @param onFrame - Work at the beginning of the next available frame.
 * @param onStall - Work after the frame timeout, without a frame.
 * @returns Cancellation using the same host that owns the frame handle.
 */
export const queueValidationFrame = (
  onFrame: () => void,
  onStall: () => void,
): (() => void) => {
  let done = false;
  const cancelFrame = cancelAnimationFrame;
  const cancel = () => {
    done = true;
    clearTimeout(timeout);
    cancelFrame(frame);
  };
  const finish = (run: () => void) => {
    if (done) return;
    cancel();
    run();
  };
  const timeout = setTimeout(
    () => finish(onStall),
    VALIDATION_FRAME_TIMEOUT_MS,
  );
  const frame = requestAnimationFrame(() => finish(onFrame));
  return cancel;
};
