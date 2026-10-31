import { scheduleCancelableMacrotask } from '@winglet/common-utils/scheduler';

import type { ValidationCadenceState } from '../../../types/validationCadence';
import { decideValidationCadence } from './decideValidationCadence';
import { scheduleValidationCadenceFrame } from './scheduleValidationCadenceFrame';

/** Advance one frame using only timing state and creator-owned continuations.
 * @param state - Active cadence state.
 * @param onFrame - Creator-owned frame continuation.
 * @param onRun - Creator-owned work continuation.
 * @returns Nothing; schedules or releases the next host handle. */
export const observeValidationCadenceFrame = (
  state: ValidationCadenceState,
  onFrame: () => void,
  onRun: (fallback: boolean) => void,
): void => {
  if (state.cancelled) return;
  state.cancelPending = undefined;
  const action = decideValidationCadence(
    state.phase === 'watch' ? 'watch' : 'carry',
    state.requested,
    state.lastRun === undefined ? Infinity : state.now() - state.lastRun,
  );
  if (action === 'idle') {
    state.phase = 'idle';
    return;
  }
  if (action === 'run') {
    state.phase = 'running';
    state.cancelPending = scheduleCancelableMacrotask(() => onRun(false));
    return;
  }
  state.phase = 'carry';
  state.requested = false;
  scheduleValidationCadenceFrame(state, onFrame, onRun);
};
