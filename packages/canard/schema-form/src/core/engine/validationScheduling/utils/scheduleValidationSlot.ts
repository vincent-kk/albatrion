import { scheduleAfterValidationFrame } from './frames/scheduleAfterValidationFrame';

/**
 * Schedule one validation callback after the next frame, with the host fallback.
 * @param run - Work to execute exactly once; the host owns frame APIs and visibility.
 * @returns Nothing; the slot cancels its losing frame, timer and task handles.
 */
export const scheduleValidationSlot = (run: () => void): void => {
  scheduleAfterValidationFrame(run);
};
