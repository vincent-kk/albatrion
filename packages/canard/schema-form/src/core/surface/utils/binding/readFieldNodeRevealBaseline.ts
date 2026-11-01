import { readFieldNodeRevealBaseline as operation } from '../../../engine';
import { requireRuntimeFieldNode } from '../../runtime/requireRuntimeFieldNode';
import type { FieldNode } from '../../type';

/** Binding-only reveal baseline operation.
 * @param node - Public occurrence sharing the current runtime.
 * @returns The engine baseline or undefined. */
export const readFieldNodeRevealBaseline = (node: FieldNode) =>
  operation(requireRuntimeFieldNode(node));
