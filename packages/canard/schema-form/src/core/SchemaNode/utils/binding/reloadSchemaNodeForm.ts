import { dispatchResetForm } from '../../../dispatch';
import type { SchemaNode } from '../../type';
import { requireRuntimeSchemaNode } from '../requireRuntimeSchemaNode';

/**
 * Binding-only; not exported from src/index.ts.
 * Delegate the binding operation through the core entry boundary.
 * @param root - Live public root
 * @param value - New load snapshot, defaulting to the retained source
 * @returns Nothing; the dispatcher completes the operation synchronously
 */
export const reloadSchemaNodeForm = (
  root: SchemaNode, value?: unknown,
): void =>
  dispatchResetForm(requireRuntimeSchemaNode(root, true), value);

