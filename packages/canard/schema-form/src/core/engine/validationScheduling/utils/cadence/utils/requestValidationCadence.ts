import { scheduleCancelableMacrotask } from '@winglet/common-utils/scheduler';

import type { ValidationCadenceState } from '../../../types/validationCadence';
import { canScheduleValidationFrame } from '../../frames/canScheduleValidationFrame';
import { scheduleAfterValidationFrame } from '../../frames/scheduleAfterValidationFrame';

/** Record a request and start an idle cadence or replace a hidden-host frame wait.
 * @param state - Creator-owned timing state receiving one new request.
 * @returns Nothing; retains at most one pending slot or observation. */
export const requestValidationCadence = (
  state: ValidationCadenceState,
  onRun: (fallback: boolean) => void,
): void => {
  if (state.cancelled) return;
  state.requested = true;
  if (!canScheduleValidationFrame()) {
    if (state.phase === 'fallback') return;
    state.cancelPending?.();
    state.phase = 'fallback';
    state.cancelPending = scheduleCancelableMacrotask(() => onRun(true));
  } else if (state.phase === 'idle') {
    state.phase = 'leading';
    state.cancelPending = scheduleAfterValidationFrame((fallback) =>
      onRun(fallback),
    );
  }
};
