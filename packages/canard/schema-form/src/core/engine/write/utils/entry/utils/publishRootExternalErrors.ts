import { FieldNodeEventType } from '../../../../record';
import type { FieldNodeRecord } from '../../../../record';
import {
  EMPTY_GLOBAL_ERRORS,
  updateFieldNodeGlobalErrors,
} from '../../../../validation';
import { queueNonSettleEvent } from '../../chain/queueNonSettleEvent';

/**
 * Recompute the form list after the root's external list changed and announce a changed aggregate.
 * The UpdateGlobalError bit carries the merged globalErrors so onValidate receives the
 * aggregate; the caller queues the root's own UpdateError.
 * @param root - Live form root whose stored external list was just replaced or removed
 * @returns Nothing; a changed aggregate joins the caller's delivery
 */
export const publishRootExternalErrors = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): void => {
  const previous = root.runtime.globalErrors ?? EMPTY_GLOBAL_ERRORS;
  updateFieldNodeGlobalErrors(root);
  if (root.runtime.globalErrors !== previous)
    queueNonSettleEvent(
      root,
      FieldNodeEventType.UpdateGlobalError,
      root.runtime.globalErrors,
    );
};
