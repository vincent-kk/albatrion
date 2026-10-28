import type { FieldNodeRecord } from '../../../record';
import { FieldNodeState } from '../../../types/state';
import type { WriteOption } from '../../../types/value';
import { dispatchBatch } from './dispatchBatch';
import { dispatchClearExternalErrors } from './dispatchClearExternalErrors';
import { dispatchSetState } from './dispatchSetState';
import { dispatchSetValue } from './dispatchSetValue';

/** State patch that marks an input occurrence dirty. */
const DIRTY_STATE_PATCH = { [FieldNodeState.Dirty]: true };

/**
 * Group input value, external-error clearing and dirty under one marked entry.
 * @param node - Input occurrence, including a retired late callback target
 * @param value - Input value or updater evaluated at the call site
 * @param option - Replacement, merge, and automatic-write flags
 * @returns Nothing; disposed input callbacks are silently discarded, while detached callbacks follow the development warning rule
 */
export const dispatchWriteInput = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  value: unknown,
  option?: WriteOption,
): void => {
  if (node.disposed || node.rootNode.disposed) return;
  dispatchBatch(node, () => {
    dispatchSetValue(node, value, option, 'input');
    if (node.disposed || node.rootNode.disposed) return;
    dispatchClearExternalErrors(node);
    dispatchSetState(node, DIRTY_STATE_PATCH);
  });
};
