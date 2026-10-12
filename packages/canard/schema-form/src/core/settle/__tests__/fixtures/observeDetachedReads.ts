import type { PlainNode } from './createPlainNode';

/**
 * Capture the departure facts of former children without comparing node identities.
 * @param root - Committed tree whose runtime stores the detached reads and watch memo
 * @param former - Children the tree held before the update, in order
 * @returns Per former child: detached flag, retained read bundle and memoized watch values
 */
export const observeDetachedReads = (
  root: PlainNode,
  former: readonly PlainNode[],
): unknown[] =>
  former.map((node) => [
    node.detached,
    root.runtime.detachedReads?.get(node),
    root.runtime.watchValuesMemo?.get(node)?.values,
  ]);
