import { filter as filterArray } from '@winglet/common-utils/array';

import { isDescendantPath } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import { resetFieldNodeSubtree } from '../../../settle';
import { WriteOption } from '../../../types/value';
import { captureChainError } from '../chain/captureChainError';
import { enterFieldNodeChain } from '../chain/enterFieldNodeChain';
import { exitFieldNodeChain } from '../chain/exitFieldNodeChain';
import { refuseInactiveResolverWrite } from '../report/refuseInactiveResolverWrite';

/**
 * Reload one subtree immediately, including when a batch is open.
 * @param node - Scope whose retained load source is restored
 * @param option - Automatic-write selection for this load
 * @returns Nothing; the outer entry delivers its committed bits
 */
export const dispatchResetSubtree = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  option: WriteOption = WriteOption.Overwrite,
): void => {
  if (node.detached) {
    refuseInactiveResolverWrite(node);
    return;
  }
  if (!enterFieldNodeChain(node)) return;
  const runtime = node.rootNode.runtime;
  if (runtime.batchWrites)
    runtime.batchWrites = filterArray(
      runtime.batchWrites,
      (write) =>
        write.node !== node && !isDescendantPath(write.node.path, node.path),
    );
  (runtime.validationTargets ??= new Set()).add(node);
  try {
    resetFieldNodeSubtree(node, option);
  } catch (error) {
    captureChainError(runtime, error);
  } finally {
    exitFieldNodeChain(node);
  }
};
