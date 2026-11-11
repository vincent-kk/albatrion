import type { FieldNodeRecord } from '../../../record';
import { FieldNodeState } from '../../../types/state';
import type { WriteOption } from '../../../types/value';
import { isBatchMarking } from '../chain/isBatchMarking';
import { readBatchValue } from '../chain/readBatchValue';
import { dispatchBatch } from './dispatchBatch';
import { dispatchClearExternalErrors } from './dispatchClearExternalErrors';
import { dispatchSetState } from './dispatchSetState';

/** State patch shared by relayed input entries. */
const EDITED_STATE_PATCH = { [FieldNodeState.Edited]: true };

/**
 * Relay one evaluated input through an overridden callback and its synchronous batch.
 * @param node - Input occurrence whose unchanged committed value may omit Refresh
 * @param input - Value or updater evaluated against the call-site pending value
 * @param option - Caller write flags passed to the callback
 * @param relay - Callback that writes the value through its owning parent
 * @returns Nothing; the outer batch owns settlement and delivery
 */
export const dispatchRelayInput = <
  Self extends FieldNodeRecord<Self>,
  Option extends WriteOption,
>(
  node: Self,
  input: unknown,
  option: Option,
  relay: (input: unknown, option: Option) => void,
): void => {
  if (node.disposed || node.rootNode.disposed) return;
  const marking = isBatchMarking(node);
  const runtime = node.rootNode.runtime;
  try {
    dispatchBatch(node, () => {
      const value =
        typeof input === 'function'
          ? input(marking ? readBatchValue(node) : node.local)
          : input;
      const relays = (runtime.inputRelays ??= []);
      const record = { node, path: node.path, value };
      const index = relays.findIndex((relay) => relay.node === node);
      if (index === -1) relays.push(record);
      else relays[index] = record;
      relay(value, option);
      if (node.disposed || node.rootNode.disposed) return;
      dispatchClearExternalErrors(node);
      dispatchSetState(node, EDITED_STATE_PATCH);
    });
  } finally {
    if (!runtime.batchDepth && runtime.inputRelays !== undefined)
      runtime.inputRelays = undefined;
  }
};
