import type { FieldNode } from '../../../../surface';

/**
 * Find the node a scene path names; the empty pointer names the root itself.
 * @param root - The form root
 * @param path - A JSON Pointer from the root
 * @returns The node, or `null` when no live node has the path
 */
export const findSceneNode = (
  root: FieldNode,
  path: string,
): FieldNode | null => (path === '' ? root : root.find(path));
