import { readFieldNodeRevealVersion as operation } from '../../../engine';
import { requireRuntimeFieldNode } from '../../runtime/requireRuntimeFieldNode';
import type { FieldNode } from '../../type';

/** Binding-only operation; not exported from src/index.ts.
 * @param node - Public occurrence retaining the engine reveal lifetime.
 * @returns The engine operation result without widening the public node. */
export const readFieldNodeRevealVersion = (node: FieldNode) =>
  operation(requireRuntimeFieldNode(node));
