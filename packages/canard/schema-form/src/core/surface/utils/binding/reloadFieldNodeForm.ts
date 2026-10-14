import { dispatchResetForm } from '../../../engine';
import type { FieldNode, SetValueOption } from '../../type';
import { requireRuntimeFieldNode } from '../requireRuntimeFieldNode';

/**
 * Binding-only; not exported from src/index.ts.
 * Delegate the binding operation through the core entry boundary.
 * @param root - Live public root
 * @param value - Required new load snapshot; it may explicitly be undefined
 * @param option - Automatic-write flags for this load
 * @returns Nothing; the dispatcher completes the operation synchronously
 */
export const reloadFieldNodeForm = (
  root: FieldNode,
  value: unknown,
  option?: SetValueOption,
): void =>
  dispatchResetForm(requireRuntimeFieldNode(root, true), value, option);
