import { isFieldNodeValidationPending as operation } from '../../../engine';
import { requireRuntimeFieldNode } from '../../runtime/requireRuntimeFieldNode';
import type { FieldNode } from '../../type';

/** Binding-only validation lifetime query.
 * @param node - Public occurrence sharing the runtime.
 * @returns Whether a write verdict is pending. */
export const isFieldNodeValidationPending = (node: FieldNode): boolean =>
  operation(requireRuntimeFieldNode(node));
