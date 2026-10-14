import { scheduleCancelableMacrotaskSafe } from '@winglet/common-utils/scheduler';

import type { Fn } from '@aileron/declare';

export interface IdleDeadlineLike {
  didTimeout: boolean;
  timeRemaining: Fn<[], number>;
}

/** Simulated time budget per tick when requestIdleCallback is unavailable */
const FALLBACK_BUDGET_MS = 8;

/**
 * Schedule a callback on browser idle time.
 * @remarks Falls back to `scheduleCancelableMacrotaskSafe` when
 *          `requestIdleCallback` is unavailable (e.g. Safari) — the Safe
 *          scheduler is setTimeout-backed in browsers, guaranteeing a
 *          rendering window between ticks; the simulated deadline reports
 *          `didTimeout: true` with a fixed budget.
 * @param callback - Invoked with an IdleDeadline-compatible object
 * @returns Cancel function (idempotent)
 */
export const scheduleIdle = (
  callback: Fn<[deadline: IdleDeadlineLike]>,
): Fn => {
  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(callback);
    return () => cancelIdleCallback(id);
  }
  return scheduleCancelableMacrotaskSafe(() =>
    callback({ didTimeout: true, timeRemaining: () => FALLBACK_BUDGET_MS }),
  );
};
