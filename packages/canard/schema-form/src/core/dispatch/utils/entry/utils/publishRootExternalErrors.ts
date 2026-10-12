import { SchemaNodeEventType } from '../../../../record';
import type { SchemaNodeRecord } from '../../../../record';
import { updateSchemaNodeGlobalErrors } from '../../../../validation';
import { queueNonSettleEvent } from '../../chain/queueNonSettleEvent';

/**
 * Recompute the form list after the root's external list changed and announce it (188C-01).
 * The UpdateGlobalError bit carries the merged globalErrors so onValidate receives the
 * aggregate; the caller queues the root's own UpdateError.
 * @param root - Live form root whose stored external list was just replaced or removed
 * @returns Nothing; the event joins the caller's delivery
 */
export const publishRootExternalErrors = <Self extends SchemaNodeRecord<Self>>(
  root: Self,
): void => {
  updateSchemaNodeGlobalErrors(root);
  queueNonSettleEvent(
    root,
    SchemaNodeEventType.UpdateGlobalError,
    root.runtime.globalErrors,
  );
};
