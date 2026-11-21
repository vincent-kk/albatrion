import { isArray } from '@winglet/common-utils/filter';

import { FormErrorCode, SchemaFormError } from '../../../../../errors';
import type { FieldNodeRecord } from '../../../record';
import {
  assertVirtualWriteShape,
  isMergeWrite,
  writeFieldNode,
} from '../../../settle';
import { FieldNodeWriteKind, WriteOption } from '../../../types/value';
import { sameValue } from '../../../utils/compute/sameValue';
import { isVirtualWriteFieldAdmitted } from '../../../utils/paths/isVirtualWriteFieldAdmitted';
import { resolveStorageTargets } from '../../../utils/paths/resolveStorageTargets';
import type { StorageTarget } from '../../../utils/paths/resolveStorageTargets';
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
    (node.isDisposed || node.rootNode.isDisposed)
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
        ? input(marking ? readBatchValue(node) : node.storedValue)
        : input;
    let virtualTargets: readonly StorageTarget<Self>[] | undefined;
    if (node.behavior.type === 'virtual') {
      assertVirtualWriteShape(node, value);
      if (sameValue(value, marking ? readBatchValue(node) : node.storedValue))
        return;
      const values = isArray(value) ? value : undefined;
      virtualTargets = resolveStorageTargets(node)?.filter(({ node, index }) =>
        isVirtualWriteFieldAdmitted(!!node, node ? undefined : values?.[index]),
      );
    }
    if (marking) {
      const writes = (node.rootNode.runtime.batchWrites ??= []);
      if (virtualTargets)
        writes.push({ node, value, option, source, virtualTargets });
      else writes.push({ node, value, option, source });
    } else {
      writeFieldNode(
        node,
        value,
        isMergeWrite(option)
          ? FieldNodeWriteKind.CallerPartial
          : FieldNodeWriteKind.CallerReplace,
        option,
        source,
        undefined,
        undefined,
        virtualTargets,
      );
    }
  } catch (error) {
    if (node.rootNode.runtime.batchDepth) throw error;
    captureChainError(node.rootNode.runtime, error);
  } finally {
    exitFieldNodeChain(node);
  }
};
