import type { ValidationCadenceState } from '../type';
import { scheduleValidationCadenceFrame } from './scheduleValidationCadenceFrame';

/** Start work with a new request baseline, then own only the required watch frame.
 * @param state - Active lifetime whose work is ready to start.
 * @param next - Observation after the run; idle suppresses further frame work.
 * @returns Nothing; callback failures propagate through the host task. */
export const runValidationCadence = (
  state: ValidationCadenceState,
  next: 'idle' | 'watch' | 'carry',
): void => {
  if (state.cancelled) return;
  state.cancelPending = undefined;
  state.lastRun = state.now();
  state.requested = false;
  state.phase = next;
  try {
    state.run();
  } finally {
    if (
      !state.cancelled &&
      (state.phase === 'watch' || state.phase === 'carry')
    )
      scheduleValidationCadenceFrame(state);
  }
};
