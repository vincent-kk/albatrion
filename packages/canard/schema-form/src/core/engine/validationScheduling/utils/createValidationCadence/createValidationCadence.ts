import type { ValidationCadence, ValidationCadenceState } from './type';
import { cancelValidationCadence } from './utils/cancelValidationCadence';
import { requestValidationCadence } from './utils/requestValidationCadence';

/**
 * Create the leading, carry, capped and trailing timing lifetime for automatic work.
 * @param run - Callback invoked after a selected frame; no domain values are inspected.
 * @param now - Caller-provided monotone clock in milliseconds.
 * @returns Every-request recording and permanent cancellation functions.
 */
export const createValidationCadence = (
  run: () => void,
  now: () => number,
): ValidationCadence => {
  const state: ValidationCadenceState = {
    run,
    now,
    phase: 'idle',
    requested: false,
    lastRun: 0,
    cancelled: false,
  };
  return {
    request: () => requestValidationCadence(state),
    cancel: () => cancelValidationCadence(state),
  };
};
