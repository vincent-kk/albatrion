import type { DispatchTestNode } from '../../../../__tests__/fixtures/createDispatchTree';
import { readFieldNodeDefaultValue } from '../../../utils/loadValues/readFieldNodeDefaultValue';
import { slotsOf } from './slotsOf';

/**
 * Walk a committed tree and read every node's public default source.
 * @param root - Committed tree
 * @returns Path and default-value source of each live node in document order
 */
export const defaultsOf = (root: DispatchTestNode): unknown[] => {
  const reads: unknown[] = [];
  const pending = [root];
  while (pending.length) {
    const node = pending.pop()!;
    reads.push([node.path, slotsOf(readFieldNodeDefaultValue(node))]);
    for (let index = (node.children?.length ?? 0) - 1; index >= 0; index--)
      pending.push(node.children![index]);
  }
  return reads;
};
