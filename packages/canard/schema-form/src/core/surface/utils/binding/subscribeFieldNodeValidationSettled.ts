import { subscribeFieldNodeValidationSettled as operation } from '../../../engine';
import { requireRuntimeFieldNode } from '../../runtime/requireRuntimeFieldNode';
import type { FieldNode } from '../../type';

/** Binding-only validation lifetime subscription.
 * @param node - Public occurrence sharing the runtime.
 * @param listener - Callback notified when a pending verdict settles.
 * @returns The subscription cleanup. */
export const subscribeFieldNodeValidationSettled = (
  node: FieldNode,
  listener: () => void,
): (() => void) => operation(requireRuntimeFieldNode(node), listener);
