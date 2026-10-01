import type { SchemaNodeRecord } from '../../../record';
import { resetSchemaNodeSubtree } from '../../../settle';
import { SetValueOption } from '../../../types/value';
import { enterSchemaNodeChain } from '../chain/enterSchemaNodeChain';
import { captureChainError } from '../chain/captureChainError';
import { exitSchemaNodeChain } from '../chain/exitSchemaNodeChain';

/**
 * Reload one subtree immediately, including when a batch is open.
 * @param node - Scope whose retained load source is restored
 * @param option - Automatic-write selection for this load
 * @returns Nothing; the outer entry delivers its committed bits
 */
export const dispatchResetSubtree = <Self extends SchemaNodeRecord<Self>>(
  node: Self, option: SetValueOption = SetValueOption.Overwrite,
): void => {
  enterSchemaNodeChain(node);
  const runtime = node.rootNode.runtime;
  if (runtime.batchWrites)
    runtime.batchWrites = runtime.batchWrites.filter((write) =>
      write.node !== node && !write.node.path.startsWith(`${node.path}/`));
  (runtime.validationTargets ??= new Set()).add(node);
  try { resetSchemaNodeSubtree(node, option); }
  catch (error) { captureChainError(runtime, error); }
  finally { exitSchemaNodeChain(node); }
};
