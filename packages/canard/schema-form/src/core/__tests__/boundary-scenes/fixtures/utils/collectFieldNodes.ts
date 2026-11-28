import type { FieldNode } from '../../../../surface';

/**
 * List a node and every live descendant, parents before children.
 * @param root - The node the walk starts at
 * @returns The nodes in document order
 */
export const collectFieldNodes = (root: FieldNode): FieldNode[] => {
  const nodes: FieldNode[] = [];
  const visit = (node: FieldNode): void => {
    nodes.push(node);
    for (const child of node.children ?? []) visit(child);
  };
  visit(root);
  return nodes;
};
