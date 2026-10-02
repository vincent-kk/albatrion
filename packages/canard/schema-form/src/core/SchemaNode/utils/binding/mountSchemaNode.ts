import { dispatchMount } from '../../../dispatch';
import type { SchemaNode, SetValueOption } from '../../type';
import { requireRuntimeSchemaNode } from '../requireRuntimeSchemaNode';

/**
 * Binding-only; not exported from src/index.ts.
 * Delegate the binding operation through the core entry boundary.
 * @param root - Unmounted public root
 * @param value - Initial source, defaulting to the load snapshot
 * @param option - Automatic-write flags for this load
 * @param settings - Defer validation until the binding is ready
 * @returns Nothing; the dispatcher completes the operation synchronously
 */
export const mountSchemaNode = (
  root: SchemaNode, value?: unknown, option?: SetValueOption,
  settings?: { deferValidation?: boolean },
): void =>
  dispatchMount(requireRuntimeSchemaNode(root, true), value, option, settings);

