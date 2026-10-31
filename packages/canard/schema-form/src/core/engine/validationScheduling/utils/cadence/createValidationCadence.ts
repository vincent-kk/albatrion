import type {
  ValidationCadence,
  ValidationCadenceState,
} from '../../types/validationCadence';
import { cancelValidationCadence } from './utils/cancelValidationCadence';
import { observeValidationCadenceFrame } from './utils/observeValidationCadenceFrame';
import { requestValidationCadence } from './utils/requestValidationCadence';
import { runValidationCadence } from './utils/runValidationCadence';

/**
 * Create the leading, carry, capped and trailing timing lifetime for automatic work.
 * @param run - Callback invoked after a selected frame; no domain values are inspected.
 * @param now - Caller-provided monotone clock in milliseconds.
 * @returns Every-request recording and permanent cancellation functions.
 */
export const createValidationCadence = (
  run: () => boolean,
  now: () => number,
): ValidationCadence => {
  const state: ValidationCadenceState = {
    run,
    now,
    phase: 'idle',
    requested: false,
    cancelled: false,
  };
  const onFrame = () => observeValidationCadenceFrame(state, onFrame, onRun);
  const onRun = (fallback: boolean) =>
    runValidationCadence(state, onFrame, onRun, fallback);
  return {
    request: () => requestValidationCadence(state, onRun),
    cancel: () => cancelValidationCadence(state),
  };
};
