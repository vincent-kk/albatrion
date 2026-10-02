import type { SchemaNodeRecord } from '../../../record';
import type { SetValueOption } from '../../../types/value';
import { NodeState } from '../../../types/state';
import { dispatchBatch } from './dispatchBatch';
import { dispatchClearExternalErrors } from './dispatchClearExternalErrors';
import { dispatchSetState } from './dispatchSetState';
import { dispatchSetValue } from './dispatchSetValue';

/**
 * Group input value, external-error clearing and dirty under one marked entry.
 * @param node - Input occurrence, including a retired late callback target
 * @param value - Input value or updater evaluated at the call site
 * @param option - Replacement, merge, and automatic-write flags
 * @returns Nothing; retired input writes are silently discarded
 */
export const dispatchWriteInput = <Self extends SchemaNodeRecord<Self>>(
  node: Self, value: unknown, option?: SetValueOption,
): void => {
  if (node.disposed || node.rootNode.disposed) return;
  dispatchBatch(node, () => {
    dispatchSetValue(node, value, option, 'input');
    if (node.disposed || node.rootNode.disposed) return;
    dispatchClearExternalErrors(node);
    dispatchSetState(node, { [NodeState.Dirty]: true });
  });
};
