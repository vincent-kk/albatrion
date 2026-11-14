import type { FieldNodeRecord } from '../../../record';
import { resetFieldNodeForm } from '../../../settle';
import { WriteOption } from '../../../types/value';
import { settleFieldNodeValidation } from '../../../validation';
import { captureChainError } from '../chain/captureChainError';
import { enterFieldNodeChain } from '../chain/enterFieldNodeChain';
import { exitFieldNodeChain } from '../chain/exitFieldNodeChain';
import { clearWarningKeys } from '../report/clearWarningKeys';
import { clearFieldNodeFormErrors } from './utils/clearFieldNodeFormErrors';

/** Shared reset settings for core loads that request validation at chain end. */
const NO_RESET_SETTINGS: { deferValidation?: boolean } = {};

/**
 * Start a new form load lifetime with a replacement root source.
 * @param root - Live form root
 * @param value - Required replacement load snapshot; undefined clears the source
 * @param option - Automatic-write selection for this load
 * @param settings - Whether the binding owns the load-validation slot
 * @returns Nothing; the outer entry delivers the load
 */
export const dispatchResetForm = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  value: unknown,
  option: WriteOption = WriteOption.Overwrite,
  settings: { deferValidation?: boolean } = NO_RESET_SETTINGS,
): void => {
  if (!enterFieldNodeChain(root, 'load')) return;
  clearWarningKeys(root.runtime);
  root.runtime.validationUnavailable = false;
  root.runtime.validationCompileReported = false;
  root.runtime.validationStamp = (root.runtime.validationStamp ?? 0) + 1;
  root.runtime.deferLoadValidation = settings.deferValidation === true;
  if (settings.deferValidation) {
    root.runtime.validationPendingTargets = undefined;
    settleFieldNodeValidation(root);
  }
  root.runtime.batchWrites = undefined;
  if (!settings.deferValidation)
    (root.runtime.validationTargets ??= new Set()).add(root);
  try {
    clearFieldNodeFormErrors(root);
    resetFieldNodeForm(root, value, option);
  } catch (error) {
    captureChainError(root.runtime, error);
  } finally {
    root.runtime.validationLoadStamp = root.runtime.validationStamp ?? 0;
    exitFieldNodeChain(root);
  }
};
