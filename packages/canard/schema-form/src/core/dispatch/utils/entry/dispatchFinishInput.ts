import type { SchemaNodeRecord } from '../../../record';
import { writeSchemaNode } from '../../../settle';
import { SetValueOption } from '../../../types/value';
import { enterSchemaNodeChain } from '../chain/enterSchemaNodeChain';
import { captureChainError } from '../chain/captureChainError';
import { exitSchemaNodeChain } from '../chain/exitSchemaNodeChain';
import { readBatchValue } from '../chain/readBatchValue';

/**
 * Finish input through its behavior row and commit a changed automatic value.
 * @param node - Input occurrence whose current source may require trimming
 * @param option - Call-local automatic-write suppression or enabling flags
 * @returns Nothing; unchanged or suppressed finishes do not write
 */
export const dispatchFinishInput = <Self extends SchemaNodeRecord<Self>>(
  node: Self, option: SetValueOption = SetValueOption.Overwrite,
): void => {
  if (node.disposed || node.rootNode.disposed) return;
  if (!enterSchemaNodeChain(node)) return;
  try {
    const runtime = node.rootNode.runtime;
    if (option & SetValueOption.DisableAutomaticWrites ||
      !(option & SetValueOption.EnableAutomaticWrites) && runtime.disableAutomaticWrites)
      return;
    const input: Self = runtime.batchDepth ?
      Object.create(node, { raw: { value: readBatchValue(node) } }) : node;
    const value = node.behavior.finishInput(input);
    if (value === undefined || value === input.raw) return;
    if (runtime.batchDepth)
      (runtime.batchWrites ??= []).push({ node, value, option, source: 'automatic' });
    else writeSchemaNode(node, value, 'automatic', option);
  } catch (error) {
    if (node.rootNode.runtime.batchDepth) throw error;
    captureChainError(node.rootNode.runtime, error);
  } finally { exitSchemaNodeChain(node); }
};
