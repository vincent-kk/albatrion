import { dispatchMount } from '../../../dispatch';
import type { FieldNode, SetValueOption } from '../../type';
import { requireRuntimeFieldNode } from '../requireRuntimeFieldNode';

/**
 * Binding-only; not exported from src/index.ts.
 * Delegate the binding operation through the core entry boundary.
 * @param root - Unmounted public root
 * @param value - Initial source, defaulting to the load snapshot
 * @param option - Automatic-write flags for this load
 * @param settings - Defer validation until the binding is ready
 * @returns Nothing; the dispatcher completes the operation synchronously
 */
export const mountFieldNode = (
  root: FieldNode,
  value?: unknown,
  option?: SetValueOption,
  settings?: { deferValidation?: boolean },
): void =>
  dispatchMount(requireRuntimeFieldNode(root, true), value, option, settings);
