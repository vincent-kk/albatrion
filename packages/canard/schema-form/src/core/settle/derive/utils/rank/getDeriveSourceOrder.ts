import type { SchemaNodeRecord } from '../../../../record';
import { getDeriveChildEntry } from './getDeriveChildEntry';

/**
 * Read a live occurrence's position in tree preorder.
 * @param source - Rule source in the current complete shape
 * @returns Root-to-source child positions
 */
export const getDeriveSourceOrder = <Self extends SchemaNodeRecord<Self>>(
  source: Self,
): readonly number[] => {
  const order: number[] = [];
  let node: Self | null = source;
  while (node?.parent) {
    const current: Self = node;
    const parent: Self | null = current.parent;
    if (!parent) break;
    const found = getDeriveChildEntry(parent.blueprintNode,
      current.name, current.blueprintNode.kind);
    order.unshift(found?.position ?? (Number(current.name) || 0));
    node = parent;
  }
  return order;
};
