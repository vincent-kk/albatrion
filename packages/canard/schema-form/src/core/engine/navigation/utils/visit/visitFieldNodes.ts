import type { FieldNodeRecord } from '../../../record';

/**
 * Visit an occurrence and its descendants in preorder, siblings in `children` order.
 * @param origin - First node visited; its subtree is the walked range
 * @param visit - Called once per reached node; returning `false` skips that node's descendants only
 * @param options - `owned` follows only children whose `parent` is the node, including detached
 *   subtrees; without it the walk follows the current shape and visits a node reached again
 *   through a reference only once
 * @returns Nothing; children are read after `visit` returns, so a node created during the walk
 *   may or may not be reached
 */
export const visitFieldNodes = <Self extends FieldNodeRecord<Self>>(
  origin: Self,
  visit: (node: Self) => boolean | void,
  options?: { readonly owned?: boolean },
): void => {
  const owned = options?.owned === true;
  const seen = owned ? undefined : new Set<Self>();
  const pending: Self[] = [origin];
  while (pending.length > 0) {
    const node = pending.pop();
    if (node === undefined) continue;
    if (seen !== undefined) {
      if (seen.has(node)) continue;
      seen.add(node);
    }
    if (visit(node) === false) continue;
    const children = node.children;
    if (children === null) continue;
    for (let index = children.length - 1; index >= 0; index--) {
      const child = children[index];
      if (!owned || child.parent === node) pending.push(child);
    }
  }
};
