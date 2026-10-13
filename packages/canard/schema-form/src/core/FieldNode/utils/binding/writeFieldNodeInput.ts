import { dispatchWriteInput } from '../../../dispatch';
import type { FieldNode, SetValueOption } from '../../type';
import { requireRuntimeFieldNode } from '../requireRuntimeFieldNode';

/**
 * Binding-only; not exported from src/index.ts.
 * Delegate the binding operation through the core entry boundary.
 * @param node - Public input occurrence, including retired callbacks
 * @param value - Input value or call-site updater
 * @param option - Replacement, merge, and automatic-write flags
 * @returns Nothing; the dispatcher completes the operation synchronously
 */
export const writeFieldNodeInput = (
  node: FieldNode,
  value: unknown,
  option?: SetValueOption,
): void => dispatchWriteInput(requireRuntimeFieldNode(node), value, option);
