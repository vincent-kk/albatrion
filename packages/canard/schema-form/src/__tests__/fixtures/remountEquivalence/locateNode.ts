import type { FieldNode } from '@/schema-form/core';

/**
 * Resolve literal names without interpreting a star as a query wildcard.
 * @param root - Live public root.
 * @param pointer - Absolute JSON Pointer, including escaped slash and tilde.
 * @returns The attached occurrence or null.
 */
export function locateNode(root: FieldNode, pointer: string): FieldNode | null {
  let node: FieldNode | null = root;
  for (const part of pointer === '' ? [] : pointer.slice(1).split('/')) {
    const name = part.replace(/~1/g, '/').replace(/~0/g, '~');
    node = node?.children?.find((child) => child.name === name) ?? null;
  }
  return node;
}
