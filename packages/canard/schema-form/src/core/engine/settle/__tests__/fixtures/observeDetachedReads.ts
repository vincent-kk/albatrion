import type { PlainNode } from '../../../__tests__/fixtures/createPlainNode';

/**
 * Capture the departure facts of former children without comparing node identities.
 * @param former - Children the tree held before the update, in order; each holds its own detached reads and watch memo
 * @returns Per former child: detached flag, retained read bundle and memoized watch values
 */
export const observeDetachedReads = (former: readonly PlainNode[]): unknown[] =>
  former.map((node) => [
    node.isDetached,
    node.__detachedReads__,
    node.__watchValues__?.values,
  ]);
