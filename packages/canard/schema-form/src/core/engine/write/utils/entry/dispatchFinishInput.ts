import type { FieldNodeRecord } from '../../../record';
import { writeFieldNode } from '../../../settle';
import { WriteOption } from '../../../types/value';
import { captureChainError } from '../chain/captureChainError';
import { enterFieldNodeChain } from '../chain/enterFieldNodeChain';
import { exitFieldNodeChain } from '../chain/exitFieldNodeChain';
import { readBatchValue } from '../chain/readBatchValue';

/**
 * Finish input through its behavior row and commit a changed automatic value.
 * @param node - Input occurrence whose current source may require trimming
 * @param option - Call-local automatic-write suppression or enabling flags
 * @returns Nothing; unchanged or suppressed finishes do not write
 */
export const dispatchFinishInput = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  option: WriteOption = WriteOption.Overwrite,
): void => {
  if (node.disposed || node.rootNode.disposed) return;
  if (!enterFieldNodeChain(node)) return;
  try {
    const runtime = node.rootNode.runtime;
    if (
      option & WriteOption.DisableAutomaticWrites ||
      (!(option & WriteOption.EnableAutomaticWrites) &&
        runtime.disableAutomaticWrites)
    )
      return;
    const input: Self = runtime.batchDepth
      ? Object.create(node, { raw: { value: readBatchValue(node) } })
      : node;
    const value = node.behavior.finishInput(input);
    if (value === undefined || value === input.raw) return;
    if (runtime.batchDepth)
      (runtime.batchWrites ??= []).push({
        node,
        value,
        option,
        source: 'automatic',
      });
    else writeFieldNode(node, value, 'automatic', option);
  } catch (error) {
    if (node.rootNode.runtime.batchDepth) throw error;
    captureChainError(node.rootNode.runtime, error);
  } finally {
    exitFieldNodeChain(node);
  }
};
