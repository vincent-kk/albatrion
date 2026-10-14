import type { FieldNodeRecord } from '../../../record';
import { resetFieldNodeForm } from '../../../settle';
import { WriteOption } from '../../../types/value';
import { captureChainError } from '../chain/captureChainError';
import { enterFieldNodeChain } from '../chain/enterFieldNodeChain';
import { exitFieldNodeChain } from '../chain/exitFieldNodeChain';
import { clearWarningKeys } from '../report/clearWarningKeys';
import { clearFieldNodeFormErrors } from './utils/clearFieldNodeFormErrors';

/**
 * Start a new form load lifetime with a replacement root source.
 * @param root - Live form root
 * @param value - Required replacement load snapshot; undefined clears the source
 * @param option - Automatic-write selection for this load
 * @returns Nothing; the outer entry delivers the load
 */
export const dispatchResetForm = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  value: unknown,
  option: WriteOption = WriteOption.Overwrite,
): void => {
  if (!enterFieldNodeChain(root)) return;
  clearWarningKeys(root.runtime);
  root.runtime.validationUnavailable = false;
  root.runtime.validationCompileReported = false;
  root.runtime.batchWrites = undefined;
  (root.runtime.validationTargets ??= new Set()).add(root);
  try {
    clearFieldNodeFormErrors(root);
    resetFieldNodeForm(root, value, option);
  } catch (error) {
    captureChainError(root.runtime, error);
  } finally {
    exitFieldNodeChain(root);
  }
};
