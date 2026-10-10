import type { SchemaNodeRecord } from '../../record';

/**
 * Visit an occurrence and only descendants it owns through parent links.
 * @param origin - Root of the departing or reindexed owned subtree
 * @param visit - Called once per owned occurrence, parent before child
 * @returns Nothing
 */
export const walkOwnedSchemaNodes = <Self extends SchemaNodeRecord<Self>>(
  origin: Self,
  visit: (node: Self) => void,
): void => {
  const pending: Self[] = [origin];
  while (pending.length > 0) {
    const node = pending.pop();
    if (!node) continue;
    visit(node);
    const children = node.children ?? [];
    for (let index = children.length - 1; index >= 0; index--)
      if (children[index].parent === node) pending.push(children[index]);
  }
};
