import { dispatchWriteInput } from '../../../engine';
import { requireRuntimeFieldNode } from '../../runtime/requireRuntimeFieldNode';
import type { FieldNode, SetValueOption } from '../../type';

/**
 * Binding-only; not exported from src/index.ts.
 * Delegate the binding operation through the core entry boundary.
 * @param node - Public input occurrence, including retired callbacks
 * @param input - Value or call-site updater
 * @param option - Replacement, merge, and automatic-write flags
 * @returns Nothing; the dispatcher completes the operation synchronously
 */
export const writeFieldNodeInput = (
  node: FieldNode,
  input: unknown,
  option?: SetValueOption,
): void => dispatchWriteInput(requireRuntimeFieldNode(node), input, option);
