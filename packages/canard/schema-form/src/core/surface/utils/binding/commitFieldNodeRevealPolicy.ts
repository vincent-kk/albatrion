import { commitFieldNodeRevealPolicy as operation } from '../../../engine';
import { requireRuntimeFieldNode } from '../../runtime/requireRuntimeFieldNode';
import type { FieldNode } from '../../type';

/** Binding-only operation; not exported from src/index.ts.
 * @param node - Public occurrence retaining the engine reveal lifetime.
 * @param value - Resolved committed Form policy.
 * @returns The engine operation result without widening the public node. */
export const commitFieldNodeRevealPolicy = (node: FieldNode, value: unknown) =>
  operation(requireRuntimeFieldNode(node), value);
