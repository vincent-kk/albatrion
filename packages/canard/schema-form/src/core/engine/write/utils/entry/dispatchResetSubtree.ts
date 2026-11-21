import { isDescendantPath } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { WriteRange } from '../../../settle';
import { resetFieldNodeSubtree } from '../../../settle';
import { WriteOption } from '../../../types/value';
import { resolveStorageTargets } from '../../../utils/paths/resolveStorageTargets';
import { captureChainError } from '../chain/captureChainError';
import { enterFieldNodeChain } from '../chain/enterFieldNodeChain';
import { exitFieldNodeChain } from '../chain/exitFieldNodeChain';
import { flushBatchWrites } from '../chain/flushBatchWrites';
import { refuseInactiveResolverWrite } from '../report/refuseInactiveResolverWrite';
import { subtractLaterMarks } from './utils/subtractLaterMarks';

/**
 * Reload one subtree immediately, including when a batch is open: marks inside the scope are
 * discarded and every other earlier mark settles first, so the load is the segment's last word.
 * When that settlement detaches the scope, the reset is refused and the in-scope marks are kept.
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
      const marks = runtime.batchWrites;
      const isContained = marks.map((write) =>
        (write.virtualTargets ?? [write.node]).every(({ path }) =>
          scopePaths.some(
            (scopePath) =>
              path === scopePath || isDescendantPath(path, scopePath),
          ),
        ),
      );
      const remaining = marks.filter((_, index) => !isContained[index]);
      runtime.batchWrites = remaining;
      const ranges: WriteRange[][] = [];
      if (remaining.length) flushBatchWrites(node.rootNode, ranges);
      if (node.isDetached) {
        let rangeIndex = 0;
        const kept = marks.flatMap((mark, index) => {
          if (!isContained[index]) {
            rangeIndex++;
            return [];
          }
          const write = subtractLaterMarks(mark, ranges, rangeIndex);
          return write ? [write] : [];
        });
        if (kept.length)
          runtime.batchWrites = [...kept, ...(runtime.batchWrites ?? [])];
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
