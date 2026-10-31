import { scheduleCancelableMacrotask } from '@winglet/common-utils/scheduler';

import { canScheduleValidationFrame } from '../../frames/canScheduleValidationFrame';
import { scheduleAfterValidationFrame } from '../../frames/scheduleAfterValidationFrame';
import type { ValidationCadenceState } from '../type';
import { runValidationCadence } from './runValidationCadence';

/** Record a request and start an idle cadence or replace a hidden-host frame wait.
 * @param state - Creator-owned timing state receiving one new request.
 * @returns Nothing; retains at most one pending slot or observation. */
export const requestValidationCadence = (
  state: ValidationCadenceState,
): void => {
  if (state.cancelled) return;
  state.requested = true;
  if (!canScheduleValidationFrame()) {
    if (state.phase === 'fallback') return;
    state.cancelPending?.();
    state.phase = 'fallback';
    state.cancelPending = scheduleCancelableMacrotask(() =>
      runValidationCadence(state, 'idle'),
    );
  } else if (state.phase === 'idle') {
    state.phase = 'leading';
    state.cancelPending = scheduleAfterValidationFrame((fallback) =>
      runValidationCadence(state, fallback ? 'idle' : 'watch'),
    );
  }
};
