import { dispatchFinishInput } from '../../../dispatch';
import type { FieldNode } from '../../type';
import { requireRuntimeFieldNode } from '../requireRuntimeFieldNode';

/**
 * Binding-only; not exported from src/index.ts.
 * Delegate the binding operation through the core entry boundary.
 * @param node - Public occurrence whose behavior finishes input
 * @returns Nothing; the dispatcher completes the operation synchronously
 */
export const finishFieldNodeInput = (node: FieldNode): void =>
  dispatchFinishInput(requireRuntimeFieldNode(node));
