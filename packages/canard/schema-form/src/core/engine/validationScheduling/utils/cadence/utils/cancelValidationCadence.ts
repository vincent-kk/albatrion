import type { ValidationCadenceState } from '../../../types/validationCadence';

/** Permanently cancel a cadence and every pending host handle it owns.
 * @param state - Creator-owned lifetime whose pending host work must stop.
 * @returns Nothing; later requests and callbacks become inert. */
export const cancelValidationCadence = (
  state: ValidationCadenceState,
): void => {
  state.cancelled = true;
  state.cancelPending?.();
  state.cancelPending = undefined;
  state.phase = 'idle';
};
