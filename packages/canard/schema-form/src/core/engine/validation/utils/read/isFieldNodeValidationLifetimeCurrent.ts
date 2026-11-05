import type { FieldNodeRecord } from '../../../record';

/**
 * Keep failure reporting on its original root and effective mode lifetime.
 * @param root - Root captured before the run; replacement retires this instance.
 * @param epoch - Effective validation mode generation captured at the same time.
 * @returns Whether reporting remains current across ordinary supersession and same-root reset.
 */
export const isFieldNodeValidationLifetimeCurrent = <
  Self extends FieldNodeRecord<Self>,
>(
  root: Self,
  epoch: number | undefined,
): boolean => !root.disposed && root.runtime.validationEpoch === epoch;
