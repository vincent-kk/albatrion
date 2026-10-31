import { scheduleCancelableMacrotask } from '@winglet/common-utils/scheduler';

import { canScheduleValidationFrame } from '../../frames/canScheduleValidationFrame';
import { queueValidationFrame } from '../../frames/queueValidationFrame';
import type { ValidationCadenceState } from '../type';
import { observeValidationCadenceFrame } from './observeValidationCadenceFrame';
import { runValidationCadence } from './runValidationCadence';

/** Observe the next host frame, or finish outstanding work when frames stop.
 * @param state - Active watch or carry phase with no pending host handle.
 * @returns Nothing; one frame or fallback now owns the next transition. */
export const scheduleValidationCadenceFrame = (
  state: ValidationCadenceState,
): void => {
  if (!canScheduleValidationFrame()) {
    if (state.phase === 'watch' && !state.requested) {
      state.phase = 'idle';
      return;
    }
    state.cancelPending = scheduleCancelableMacrotask(() =>
      runValidationCadence(state, 'idle'),
    );
    return;
  }
  state.cancelPending = queueValidationFrame(
    () => observeValidationCadenceFrame(state),
    () => {
      state.cancelPending = undefined;
      if (state.phase === 'watch' && !state.requested) state.phase = 'idle';
      else runValidationCadence(state, 'idle');
    },
  );
};
