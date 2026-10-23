import { FieldNodeRequestType } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import { assertFieldNodeWritable } from '../../../settle';
import { closeNonSettleEntry } from '../chain/closeNonSettleEntry';
import { queueNonSettleEvent } from '../chain/queueNonSettleEvent';
import { refuseListenerFeedback } from '../chain/refuseListenerFeedback';
import { assertNotInDelivery } from '../report/assertNotInDelivery';

/**
 * Deliver one renderer command without opening a value-write entry.
 * @param node - Live occurrence addressed by the command
 * @param kind - One supported request bit, never an OR-ed combination
 * @returns Nothing; delivery is synchronous outside a public write
 */
export const dispatchRequest = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  kind: FieldNodeRequestType,
): void => {
  assertFieldNodeWritable(node);
  if (node.detached) return;
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  if (
    kind !== FieldNodeRequestType.Focus &&
    kind !== FieldNodeRequestType.Select &&
    kind !== FieldNodeRequestType.Refresh &&
    kind !== FieldNodeRequestType.Remount
  )
    return;
  if (refuseListenerFeedback(runtime)) return;
  queueNonSettleEvent(node, kind);
  closeNonSettleEntry(node);
};
