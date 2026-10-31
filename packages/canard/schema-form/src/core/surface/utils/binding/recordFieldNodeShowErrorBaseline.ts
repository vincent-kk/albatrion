import { recordFieldNodeShowErrorBaseline as operation } from '../../../engine';
import { requireRuntimeFieldNode } from '../../runtime/requireRuntimeFieldNode';
import type { FieldNode } from '../../type';

/** Binding-only reveal baseline operation.
 * @param node - Public occurrence sharing the current runtime.
 * @param value - Opaque current Form policy.
 * @returns Nothing; the engine records its lifetime. */
export const recordFieldNodeShowErrorBaseline = (
  node: FieldNode,
  value: unknown,
) => operation(requireRuntimeFieldNode(node), value);
