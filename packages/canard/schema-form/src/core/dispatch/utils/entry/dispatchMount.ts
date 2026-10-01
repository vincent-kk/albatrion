import type { SchemaNodeRecord } from '../../../record';
import { loadSchemaNodeAtMount } from '../../../settle';
import { SetValueOption } from '../../../types/value';
import { enterSchemaNodeChain } from '../chain/enterSchemaNodeChain';
import { exitSchemaNodeChain } from '../chain/exitSchemaNodeChain';

/**
 * Commit the first form source through the same entry boundary as later writes.
 * @param root - Unloaded form root
 * @param value - Initial source, defaulting to the retained snapshot
 * @param option - Automatic-write selection for this load
 * @returns Nothing; committed events are delivered before returning
 */
export const dispatchMount = <Self extends SchemaNodeRecord<Self>>(
  root: Self, value: unknown = root.runtime.loadSnapshot,
  option: SetValueOption = SetValueOption.Overwrite,
): void => {
  enterSchemaNodeChain(root);
  (root.runtime.validationTargets ??= new Set()).add(root);
  try { loadSchemaNodeAtMount(root, value, option); }
  catch (error) { root.runtime.chainErrors?.push(error); }
  finally { exitSchemaNodeChain(root); }
};
