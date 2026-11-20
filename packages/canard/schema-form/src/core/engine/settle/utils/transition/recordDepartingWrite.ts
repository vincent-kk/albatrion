import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';

/** Annotates the lazily created `departingWrites`; an argument-less `new Map()` would be `Map<any, any>`. */
type DepartingWrites<Self> = Map<Self, unknown>;

/**
 * Keep a declarative value named for a child that leaves in this settlement until its exit is final.
 * Compute decided the exit before derive ran, so the value is the same write made after the exit:
 * the exit policy runs first and this value then replaces its result.
 * @param departing - Occurrence awaiting its exit, found by `findDepartingChild`
 * @param value - Defined value the automatic write names for it; a later write in rank order replaces it
 * @param context - Settlement that applies the value in `finalizeExits`
 * @returns Nothing
 */
export const recordDepartingWrite = <Self extends FieldNodeRecord<Self>>(
  departing: Self,
  value: unknown,
  context: SettlementContext<Self>,
): void => {
  const writes: DepartingWrites<Self> = (context.departingWrites ??= new Map());
  writes.set(departing, value);
};
