import type { FieldNode } from '../../core';
import { requireRuntimeFieldNode } from '../../core/surface/runtime/requireRuntimeFieldNode';

/** Read private validation and reveal state for verification; the exact import edge is declared in surface/DETAIL.
 * @param node - Public occurrence created by the real Form binding.
 * @returns Its existing runtime, without adding a product export. */
export const readFieldNodeRuntime = (node: FieldNode) =>
  requireRuntimeFieldNode(node).rootNode.runtime;
