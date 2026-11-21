import type { FieldNodeRecord } from '../../../record';
import type { DepartingWrite } from '../../types/departingWrite';
import type { SettlementContext } from '../../types/settlement';

/**
 * Keep a declarative value named for an address at or below a node leaving in this settlement until
 * its exit is final. Compute decided the exit before derive ran, so the value is the same write made
 * after the exit: the exit policy runs first and this value then replaces its result.
 * @param write - Leaving node, address below it, kind and defined value, recorded in rank order
 * @param context - Settlement that applies the value in `finalizeExits`
 * @returns Nothing
 */
export const recordDepartingWrite = <Self extends FieldNodeRecord<Self>>(
  write: DepartingWrite<Self>,
  context: SettlementContext<Self>,
): void => {
  (context.departingWrites ??= []).push(write);
};
