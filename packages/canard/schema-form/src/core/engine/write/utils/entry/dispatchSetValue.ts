import { FormErrorCode, SchemaFormError } from '../../../../../errors';
import type { FieldNodeRecord } from '../../../record';
import { assertVirtualWriteShape, writeFieldNode } from '../../../settle';
import { FieldNodeWriteKind, WriteOption } from '../../../types/value';
import { captureChainError } from '../chain/captureChainError';
import { enterFieldNodeChain } from '../chain/enterFieldNodeChain';
import { exitFieldNodeChain } from '../chain/exitFieldNodeChain';
import { isBatchMarking } from '../chain/isBatchMarking';
import { readBatchValue } from '../chain/readBatchValue';
import { refuseDetachedWrite } from '../report/refuseDetachedWrite';

/**
 * Commit a public value write or mark it within the current batch.
 * @param node - Live or retained target occurrence
 * @param input - Value or updater evaluated at its call site
 * @param option - Replacement, merge, and automatic-write flags
 * @param source - Binding-only origin carried independently of public flags
 * @returns Nothing; outer entry owns notification and failures
 */
export const dispatchSetValue = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  input: unknown,
  option: WriteOption = WriteOption.Overwrite,
  source?: FieldNodeWriteKind.Input,
): void => {
  if (refuseDetachedWrite(node)) return;
  if (
    source === FieldNodeWriteKind.Input &&
    (node.disposed || node.rootNode.disposed)
  )
    return;
  if (!enterFieldNodeChain(node)) return;
  try {
    if (option & WriteOption.Overwrite && option & WriteOption.Merge)
      throw new SchemaFormError(
        FormErrorCode.InvalidWriteOption,
        'Overwrite and Merge cannot be combined',
        { path: node.path, option },
      );
    const marking = isBatchMarking(node);
    const value =
      typeof input === 'function'
        ? input(marking ? readBatchValue(node) : node.local)
        : input;
    if (marking) {
      if (node.behavior.type === 'virtual')
        assertVirtualWriteShape(node, value);
      (node.rootNode.runtime.batchWrites ??= []).push({
        node,
        value,
        option,
        source,
      });
    } else {
      const merge =
        (option & WriteOption.Merge) === WriteOption.Merge &&
        !(option & WriteOption.Replace);
      writeFieldNode(
        node,
        value,
        merge
          ? FieldNodeWriteKind.CallerPartial
          : FieldNodeWriteKind.CallerReplace,
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
