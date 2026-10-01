import type { SchemaNodeRecord } from '../../../record';
import { writeSchemaNode } from '../../../settle';
import { SetValueOption } from '../../../types/value';
import { enterSchemaNodeChain } from '../chain/enterSchemaNodeChain';
import { captureChainError } from '../chain/captureChainError';
import { exitSchemaNodeChain } from '../chain/exitSchemaNodeChain';
import { readBatchValue } from '../chain/readBatchValue';

/**
 * Commit a public value write or mark it within the current batch.
 * @param node - Live or retained target occurrence
 * @param value - Input value or updater evaluated at its call site
 * @param option - Replacement, merge, and automatic-write flags
 * @returns Nothing; outer entry owns notification and failures
 */
export const dispatchSetValue = <Self extends SchemaNodeRecord<Self>>(
  node: Self, value: unknown, option: SetValueOption = SetValueOption.Overwrite,
): void => {
  if (!enterSchemaNodeChain(node)) return;
  try {
    const runtime = node.rootNode.runtime;
    const input = typeof value === 'function' ?
      value(runtime.batchDepth ? readBatchValue(node) : node.local) : value;
    if (runtime.batchDepth) {
      (runtime.batchWrites ??= []).push({ node, value: input, option });
    } else {
      const merge = (option & SetValueOption.Merge) === SetValueOption.Merge &&
        !(option & SetValueOption.Replace);
      writeSchemaNode(node, input, merge ? 'callerPartial' : 'callerReplace', option);
    }
  } catch (error) {
    if (node.rootNode.runtime.batchDepth) throw error;
    captureChainError(node.rootNode.runtime, error);
  } finally {
    exitSchemaNodeChain(node);
  }
};
