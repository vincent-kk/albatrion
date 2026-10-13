import { INVALID_WRITE_OPTION, SchemaFormError } from '../../../../errors';
import type { FieldNodeRecord } from '../../../record';
import { assertVirtualWriteShape, writeFieldNode } from '../../../settle';
import { WriteOption } from '../../../types/value';
import { captureChainError } from '../chain/captureChainError';
import { enterFieldNodeChain } from '../chain/enterFieldNodeChain';
import { exitFieldNodeChain } from '../chain/exitFieldNodeChain';
import { readBatchValue } from '../chain/readBatchValue';

/**
 * Commit a public value write or mark it within the current batch.
 * @param node - Live or retained target occurrence
 * @param value - Input value or updater evaluated at its call site
 * @param option - Replacement, merge, and automatic-write flags
 * @param source - Binding-only origin carried independently of public flags
 * @returns Nothing; outer entry owns notification and failures
 */
export const dispatchSetValue = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  value: unknown,
  option: WriteOption = WriteOption.Overwrite,
  source?: 'input',
): void => {
  if (source === 'input' && (node.disposed || node.rootNode.disposed)) return;
  if (!enterFieldNodeChain(node)) return;
  try {
    if (option & WriteOption.Overwrite && option & WriteOption.Merge)
      throw new SchemaFormError(
        INVALID_WRITE_OPTION,
        'Overwrite and Merge cannot be combined',
        { path: node.path, option },
      );
    const runtime = node.rootNode.runtime;
    const input =
      typeof value === 'function'
        ? value(runtime.batchDepth ? readBatchValue(node) : node.local)
        : value;
    if (runtime.batchDepth) {
      if (node.behavior.type === 'virtual')
        assertVirtualWriteShape(node, input);
      (runtime.batchWrites ??= []).push({ node, value: input, option, source });
    } else {
      const merge =
        (option & WriteOption.Merge) === WriteOption.Merge &&
        !(option & WriteOption.Replace);
      writeFieldNode(
        node,
        input,
        merge ? 'callerPartial' : 'callerReplace',
        option,
        source,
      );
    }
  } catch (error) {
    if (node.rootNode.runtime.batchDepth) throw error;
    captureChainError(node.rootNode.runtime, error);
  } finally {
    exitFieldNodeChain(node);
  }
};
