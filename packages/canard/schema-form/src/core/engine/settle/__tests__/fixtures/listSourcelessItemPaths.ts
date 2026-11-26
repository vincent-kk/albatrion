import type { FieldNode } from '@/schema-form/core/surface';

/** Node types of the leaves that keep an empty item as a null source at a non-nullable item position. */
const LEAF_TYPES: readonly string[] = ['string', 'number', 'boolean', 'union'];

/**
 * List the live item positions that break the empty item invariant after a public call.
 * @param root - Root of a mounted public tree; only live nodes reachable through `children` are read
 * @returns Paths, in document order, of non-nullable leaf items of branch arrays whose source is undefined
 */
export const listSourcelessItemPaths = (root: FieldNode): string[] => {
  const paths: string[] = [];
  const visit = (node: FieldNode): void => {
    const parent = node.parentNode;
    if (
      parent?.type === 'array' &&
      parent.strategy === 'branch' &&
      !node.isNullable &&
      LEAF_TYPES.includes(node.type) &&
      node.source === undefined
    )
      paths.push(node.path);
    for (const child of node.children ?? []) visit(child);
  };
  visit(root);
  return paths;
};
