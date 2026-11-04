import { visitFieldNodes } from '../../../navigation';
import { advanceFieldNodeRevealSequence } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import { captureChainError } from '../chain/captureChainError';
import { exitFieldNodeChain } from '../chain/exitFieldNodeChain';
import { flushBatchWrites } from '../chain/flushBatchWrites';
import { resolveFieldNodeChainRoot } from '../chain/resolveFieldNodeChainRoot';

/**
 * Visit a current-shape subtree in preorder and settle the visitor's writes once at the end.
 * The walk enters no chain, so a read-only walk costs nothing and also runs inside a listener.
 * The first write during the walk opens a batch unless one is open (`enterFieldNodeChain`);
 * the outermost walk closes it with one settlement from the root, as `batch` does (191C-01).
 * @param node - First occurrence visited; the walk covers its subtree in the current shape
 * @param visitor - Called once per occurrence; returning `false` skips that occurrence's descendants
 * @returns Nothing; a visitor throw is rethrown after the writes it marked commit
 */
export const dispatchVisitSubtree = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  visitor: (node: Self) => boolean | void,
): void => {
  const runtime = resolveFieldNodeChainRoot(node.rootNode).runtime;
  advanceFieldNodeRevealSequence(node);
  runtime.visitDepth = (runtime.visitDepth ?? 0) + 1;
  try {
    visitFieldNodes(node, visitor);
  } catch (error) {
    const active = resolveFieldNodeChainRoot(node.rootNode).runtime;
    if (active.visitDepth !== 1 || active.visitBatchEntry === undefined)
      throw error;
    captureChainError(active, error);
  } finally {
    const activeRoot = resolveFieldNodeChainRoot(node.rootNode);
    const active = activeRoot.runtime;
    active.visitDepth = (active.visitDepth ?? 1) - 1;
    const entry = active.visitDepth ? undefined : active.visitBatchEntry;
    if (entry !== undefined) {
      active.visitBatchEntry = undefined;
      active.batchDepth = (active.batchDepth ?? 1) - 1;
      if (!active.batchDepth) flushBatchWrites(activeRoot);
      exitFieldNodeChain(entry);
    }
  }
};
