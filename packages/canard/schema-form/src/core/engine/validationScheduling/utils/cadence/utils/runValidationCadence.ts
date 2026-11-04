import type { ValidationCadenceState } from '../../../types/validationCadence';
import { scheduleValidationCadenceFrame } from './scheduleValidationCadenceFrame';

/** Start work with a new request baseline, then own only the required watch frame.
 * @param state - Active lifetime whose work is ready to start.
 * @param onFrame - Creator-owned frame continuation.
 * @param onRun - Creator-owned run continuation.
 * @param fallback - Whether the host cannot continue observing frames.
 * @returns Nothing; callback failures propagate through the host task. */
export const runValidationCadence = (
  state: ValidationCadenceState,
  onFrame: () => void,
  onRun: (fallback: boolean) => void,
  fallback: boolean,
): void => {
  if (state.cancelled) return;
  state.cancelPending = undefined;
  const startedAt = state.now();
  state.requested = false;
  state.phase = fallback ? 'idle' : 'watch';
  try {
    if (state.run()) state.lastRun = startedAt;
  } finally {
    if (!state.cancelled && state.phase === 'watch')
      scheduleValidationCadenceFrame(state, onFrame, onRun);
  }
};
