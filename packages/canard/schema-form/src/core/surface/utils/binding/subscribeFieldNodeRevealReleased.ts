import { subscribeFieldNodeRevealReleased as operation } from '../../../engine';
import { requireRuntimeFieldNode } from '../../runtime/requireRuntimeFieldNode';
import type { FieldNode } from '../../type';

/** Binding-only operation; not exported from src/index.ts.
 * @param node - Public occurrence retaining the engine reveal lifetime.
 * @param listener - Release callback for the holding display.
 * @returns The engine operation result without widening the public node. */
export const subscribeFieldNodeRevealReleased = (
  node: FieldNode,
  listener: () => void,
) => operation(requireRuntimeFieldNode(node), listener);
