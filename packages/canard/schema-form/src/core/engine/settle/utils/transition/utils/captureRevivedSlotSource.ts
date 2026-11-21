import type { FieldNodeRecord } from '../../../../record';
import type {
  DepartingWrite,
  RevivedSlotSource,
} from '../../../types/departingWrite';
import type { SettlementContext } from '../../../types/settlement';
import { captureRevivedBindingSource } from './revivedSlots/captureRevivedBindingSource';

/**
 * Bind the named input of a cancelled exit to the occurrences receiving it.
 * @param target - Actual occurrence selected for the whole revival write
 * @param write - Departing write in its original application order
 * @param context - Settlement that may later replace or detach the bindings
 * @returns Rights tree with one independently replaceable channel per named binding
 */
export const captureRevivedSlotSource = <Self extends FieldNodeRecord<Self>>(
  target: Self,
  write: DepartingWrite<Self>,
  context: SettlementContext<Self>,
): RevivedSlotSource<Self> => {
  context.hasRevivedSlotSources = true;
  const seen = new WeakSet<object>();
  return captureRevivedBindingSource(
    target,
    write.template,
    write.suffix,
    write.value,
    undefined,
    write,
    context,
    seen,
  );
};
