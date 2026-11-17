import type { FieldNode } from '../../core';
import { releaseFieldNodeRevealHistory as releaseHistory } from '../../core/engine/validation';
import { requireRuntimeFieldNode } from '../../core/surface/runtime/requireRuntimeFieldNode';

/** Release the existing root history when a verification fixture holds only a public node.
 * @param node - Public occurrence created by the real Form binding.
 * @returns Nothing; composes the declared verification bridge with the existing root-wide release. */
export const releaseFieldNodeRevealHistory = (node: FieldNode): void => {
  releaseHistory(requireRuntimeFieldNode(node).rootNode);
};
