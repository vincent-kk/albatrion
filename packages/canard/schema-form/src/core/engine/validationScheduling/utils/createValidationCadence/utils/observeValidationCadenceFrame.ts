import { scheduleCancelableMacrotask } from '@winglet/common-utils/scheduler';

import { VALIDATION_CADENCE_CAP_MS } from '../../constants';
import type { ValidationCadenceState } from '../type';
import { runValidationCadence } from './runValidationCadence';
import { scheduleValidationCadenceFrame } from './scheduleValidationCadenceFrame';

/** Decide one frame's watch, carry, trailing or cap transition.
 * @param state - Active lifetime at its next observation frame.
 * @returns Nothing; schedules one continuation or releases the idle loop. */
export const observeValidationCadenceFrame = (
  state: ValidationCadenceState,
): void => {
  if (state.cancelled) return;
  state.cancelPending = undefined;
  if (state.phase === 'watch') {
    if (!state.requested) {
      state.phase = 'idle';
      return;
    }
    state.phase = 'carry';
  } else if (
    !state.requested ||
    state.now() - state.lastRun >= VALIDATION_CADENCE_CAP_MS
  ) {
    const next = state.requested ? 'carry' : 'watch';
    state.phase = 'running';
    state.cancelPending = scheduleCancelableMacrotask(() =>
      runValidationCadence(state, next),
    );
    return;
  }
  state.requested = false;
  scheduleValidationCadenceFrame(state);
};
