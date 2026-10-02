import { dispatchWriteInput } from '../../../dispatch';
import type { SchemaNode, SetValueOption } from '../../type';
import { requireRuntimeSchemaNode } from '../requireRuntimeSchemaNode';

/**
 * Binding-only; not exported from src/index.ts.
 * Delegate the binding operation through the core entry boundary.
 * @param node - Public input occurrence, including retired callbacks
 * @param value - Input value or call-site updater
 * @param option - Replacement, merge, and automatic-write flags
 * @returns Nothing; the dispatcher completes the operation synchronously
 */
export const writeSchemaNodeInput = (
  node: SchemaNode, value: unknown, option?: SetValueOption,
): void =>
  dispatchWriteInput(requireRuntimeSchemaNode(node), value, option);

