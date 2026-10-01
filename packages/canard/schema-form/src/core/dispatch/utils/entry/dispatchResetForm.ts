import type { SchemaNodeRecord } from '../../../record';
import { resetSchemaNodeForm } from '../../../settle';
import { SetValueOption } from '../../../types/value';
import { enterSchemaNodeChain } from '../chain/enterSchemaNodeChain';
import { exitSchemaNodeChain } from '../chain/exitSchemaNodeChain';

/**
 * Start a new form load lifetime with a replacement root source.
 * @param root - Live form root
 * @param value - Replacement load snapshot, defaulting to the retained source
 * @param option - Automatic-write selection for this load
 * @returns Nothing; the outer entry delivers the load
 */
export const dispatchResetForm = <Self extends SchemaNodeRecord<Self>>(
  root: Self, value: unknown = root.runtime.loadSnapshot,
  option: SetValueOption = SetValueOption.Overwrite,
): void => {
  enterSchemaNodeChain(root);
  root.runtime.batchWrites = undefined;
  (root.runtime.validationTargets ??= new Set()).add(root);
  try { resetSchemaNodeForm(root, value, option); }
  catch (error) { root.runtime.chainErrors?.push(error); }
  finally { exitSchemaNodeChain(root); }
};
