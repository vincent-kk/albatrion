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
import { isMarkOverridden } from './utils/isMarkOverridden';

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
      const marks = runtime.batchWrites.map((write) => {
        const storage = resolveStorageTargets(write.node);
        const paths = storage
          ? storage.map((field) => field.path)
          : [write.node.path];
        return {
          write,
          paths,
          option: write.option,
          value: write.value,
          isContained: paths.every((path) =>
            scopePaths.some(
              (scopePath) =>
                path === scopePath || isDescendantPath(path, scopePath),
            ),
          ),
        };
      });
      const remaining = marks.filter((mark) => !mark.isContained);
      runtime.batchWrites = remaining.map((mark) => mark.write);
      if (remaining.length) flushBatchWrites(node.rootNode);
      if (node.isDetached) {
        // The refused reset discards nothing: in-scope marks a later mark did not replace stay as
        // the first caller marks of the next segment.
        const kept = marks.filter(
          (mark, index) =>
            mark.isContained &&
            !marks.some(
              (later, laterIndex) =>
                laterIndex > index &&
                !later.isContained &&
                isMarkOverridden(mark, later),
            ),
        );
        if (kept.length)
          runtime.batchWrites = [
            ...kept.map((mark) => mark.write),
            ...(runtime.batchWrites ?? []),
          ];
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
