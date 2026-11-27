import { dispatchFinishInput } from '../../../engine';
import { requireRuntimeFieldNode } from '../../runtime/requireRuntimeFieldNode';
import type { FieldNode } from '../../type';

/**
 * Binding-only; not exported from src/index.ts.
 * Delegate the binding operation through the core entry boundary.
 * @param node - Public occurrence whose behavior finishes input
 * @returns Nothing; the dispatcher completes the operation synchronously
 */
export const finishFieldNodeInput = (node: FieldNode): void =>
  dispatchFinishInput(requireRuntimeFieldNode(node));
