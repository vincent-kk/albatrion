import { scheduleCancelableMacrotask } from '@winglet/common-utils/scheduler';

import type { ValidationCadenceState } from '../../../types/validationCadence';
import { canScheduleValidationFrame } from '../../frames/canScheduleValidationFrame';
import { queueValidationFrame } from '../../frames/queueValidationFrame';

/** Observe the next host frame, or finish outstanding work when frames stop.
 * @param state - Active watch or carry phase with no pending host handle.
 * @returns Nothing; one frame or fallback now owns the next transition. */
export const scheduleValidationCadenceFrame = (
  state: ValidationCadenceState,
  onFrame: () => void,
  onRun: (fallback: boolean) => void,
): void => {
  if (!canScheduleValidationFrame()) {
    if (state.phase === 'watch' && !state.requested) {
      state.phase = 'idle';
      return;
    }
    state.cancelPending = scheduleCancelableMacrotask(() => onRun(true));
    return;
  }
  state.cancelPending = queueValidationFrame(onFrame, () => {
    state.cancelPending = undefined;
    if (state.phase === 'watch' && !state.requested) state.phase = 'idle';
    else onRun(true);
  });
};
