import type { Dictionary } from '@aileron/declare';

import { dispatchContextChange } from '../../engine';
import type { FieldNode } from '../type';
import { requireRuntimeFieldNode } from './requireRuntimeFieldNode';

/**
 * Delegate a binding context change to one synchronous settlement.
 * @param root - Public view of the live tree root
 * @param context - Already merged Form and provider context
 * @returns Nothing; the runtime slot and tree settle together
 */
export const setContext = (
  root: FieldNode,
  context: Readonly<Dictionary<unknown>>,
): void => dispatchContextChange(requireRuntimeFieldNode(root, true), context);
