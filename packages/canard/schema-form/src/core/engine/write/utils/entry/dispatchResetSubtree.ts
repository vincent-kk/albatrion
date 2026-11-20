import { isDescendantPath } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import { resetFieldNodeSubtree } from '../../../settle';
import { WriteOption } from '../../../types/value';
import { resolveStorageTargets } from '../../../utils/paths/resolveStorageTargets';
import { captureChainError } from '../chain/captureChainError';
import { enterFieldNodeChain } from '../chain/enterFieldNodeChain';
import { exitFieldNodeChain } from '../chain/exitFieldNodeChain';
import { flushBatchWrites } from '../chain/flushBatchWrites';
import { refuseInactiveResolverWrite } from '../report/refuseInactiveResolverWrite';

/**
 * Reload one subtree immediately, including when a batch is open: marks inside the scope are
 * discarded and every other earlier mark settles first, so the load is the segment's last word.
 * @param node - Scope whose retained load source is restored
 * @param option - Automatic-write selection for this load
 * @returns Nothing; the outer entry delivers its committed bits
 */
export const dispatchResetSubtree = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  option: WriteOption = WriteOption.Overwrite,
): void => {
  if (node.isDetached) {
    refuseInactiveResolverWrite(node);
    return;
  }
  if (!enterFieldNodeChain(node)) return;
  const runtime = node.rootNode.runtime;
  (runtime.validationTargets ??= new Set()).add(node);
  try {
    if (runtime.batchWrites) {
      const scope = resolveStorageTargets(node);
      const scopePaths = scope ? scope.map((field) => field.path) : [node.path];
      const remaining: typeof runtime.batchWrites = [];
      for (const write of runtime.batchWrites) {
        const storage = resolveStorageTargets(write.node);
        const paths = storage
          ? storage.map((field) => field.path)
          : [write.node.path];
        const isContained = paths.every((path) =>
          scopePaths.some(
            (scopePath) =>
              path === scopePath || isDescendantPath(path, scopePath),
          ),
        );
        if (!isContained) remaining.push(write);
      }
      runtime.batchWrites = remaining;
      if (remaining.length) flushBatchWrites(node.rootNode);
      if (node.isDetached) {
        refuseInactiveResolverWrite(node);
        return;
      }
    }
    resetFieldNodeSubtree(node, option);
  } catch (error) {
    captureChainError(runtime, error);
  } finally {
    exitFieldNodeChain(node);
  }
};
