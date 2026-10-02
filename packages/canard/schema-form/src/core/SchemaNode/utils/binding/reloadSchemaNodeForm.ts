import { dispatchResetForm } from '../../../dispatch';
import type { SchemaNode, SetValueOption } from '../../type';
import { requireRuntimeSchemaNode } from '../requireRuntimeSchemaNode';

/**
 * Binding-only; not exported from src/index.ts.
 * Delegate the binding operation through the core entry boundary.
 * @param root - Live public root
 * @param value - Required new load snapshot; it may explicitly be undefined
 * @param option - Automatic-write flags for this load
 * @returns Nothing; the dispatcher completes the operation synchronously
 */
export const reloadSchemaNodeForm = (
  root: SchemaNode, value: unknown, option?: SetValueOption,
): void =>
  dispatchResetForm(requireRuntimeSchemaNode(root, true), value, option);
