import type { FieldNodeRecord } from '../../../record';
import { ValidationMode } from '../../../types/state';
import { commitFieldNodeRevealPolicy } from './commitFieldNodeRevealPolicy';
import { dropFieldNodeRevealBaselines } from './dropFieldNodeRevealBaselines';

/**
 * Replace a trigger lifetime while retaining compiled resources and load failures.
 * @param root - Live root whose caller owns final error delivery and release notification.
 * @param mode - Raw committed mode; OnChange combinations share one effective mode.
 * @param policy - Opaque committed display policy installed before release listeners run.
 * @returns Whether the effective trigger lifetime changed and owes a binding slot update.
 */
export const transitionFieldNodeValidation = <
  Self extends FieldNodeRecord<Self>,
>(
  root: Self,
  mode: ValidationMode | undefined,
  policy: unknown,
): boolean => {
  const runtime = root.runtime;
  const previous = runtime.validationMode;
  runtime.validationMode = mode;
  if (effectiveMode(previous) === effectiveMode(mode)) {
    commitFieldNodeRevealPolicy(root, policy);
    return false;
  }
  runtime.validationEpoch = (runtime.validationEpoch ?? 0) + 1;
  runtime.validationStamp = (runtime.validationStamp ?? 0) + 1;
  runtime.validationActivationStamp = runtime.validationStamp;
  runtime.validationCadence?.cancel();
  runtime.validationCadence = undefined;
  runtime.validationRun = undefined;
  runtime.validationRequestStamp = undefined;
  runtime.validationPendingTargets = undefined;
  runtime.validationRunning = undefined;
  runtime.validationPendingEntryStamp = undefined;
  runtime.validationPending = false;
  dropFieldNodeRevealBaselines(root);
  runtime.revealPolicy = { value: policy, entries: [] };
  return true;
};

/** Normalize trigger bits without changing the raw setting.
 * @param mode - Committed trigger bits, including the default enabled state.
 * @returns Off, manual or automatic identity for transition comparison. */
const effectiveMode = (mode: ValidationMode | undefined): number =>
  mode === ValidationMode.None
    ? 0
    : (mode ?? ValidationMode.None) & ValidationMode.OnChange
      ? 2
      : 1;
