// Loaded by validation stories; the private surface accessor supports story verification without product exports.
import type { FieldNode } from '../../src/core';
import { requireRuntimeFieldNode } from '../../src/core/surface/runtime/requireRuntimeFieldNode';

/** Read the existing story Form runtime.
 * @param node - Public occurrence retained by the story handle.
 * @returns Its validation and reveal lifetime state. */
export const readFieldNodeRuntime = (node: FieldNode) =>
  requireRuntimeFieldNode(node).rootNode.runtime;
