import type { SchemaNodeRecord } from '../../../record';
import { resetSchemaNodeForm } from '../../../settle';
import { SetValueOption } from '../../../types/value';
import { enterSchemaNodeChain } from '../chain/enterSchemaNodeChain';
import { captureChainError } from '../chain/captureChainError';
import { exitSchemaNodeChain } from '../chain/exitSchemaNodeChain';
import { clearWarningKeys } from '../report/clearWarningKeys';
import { clearSchemaNodeFormErrors } from './utils/clearSchemaNodeFormErrors';

/**
 * Start a new form load lifetime with a replacement root source.
 * @param root - Live form root
 * @param value - Required replacement load snapshot; undefined clears the source
 * @param option - Automatic-write selection for this load
 * @returns Nothing; the outer entry delivers the load
 */
export const dispatchResetForm = <Self extends SchemaNodeRecord<Self>>(
  root: Self, value: unknown,
  option: SetValueOption = SetValueOption.Overwrite,
): void => {
  if (!enterSchemaNodeChain(root)) return;
  clearWarningKeys(root.runtime);
  root.runtime.validationUnavailable = false;
  root.runtime.validationCompileReported = false;
  root.runtime.batchWrites = undefined;
  (root.runtime.validationTargets ??= new Set()).add(root);
  try {
    clearSchemaNodeFormErrors(root);
    resetSchemaNodeForm(root, value, option);
  }
  catch (error) { captureChainError(root.runtime, error); }
  finally { exitSchemaNodeChain(root); }
};
