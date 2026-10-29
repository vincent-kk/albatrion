import type { FieldNodeRecord } from '../../../record';
import type { InactiveSlotCandidate } from '../../types/slots';
import { EMPTY_VALUES } from '../detached/emptyDetachedReads';
import { collectHostSlotValues } from './collectHostSlotValues';
import { compareSlotOrder } from './compareSlotOrder';
import { getSlotOrder } from './getSlotOrder';

/**
 * Materialize one host's frozen inactive list once per committed change.
 * @param host - Live or detached reference that owns its source graph and memo
 * @returns The previous array when its public item sequence is unchanged
 */
export const materializeInactiveSlotValues = <
  Self extends FieldNodeRecord<Self>,
>(
  host: Self,
): readonly { path: string; value: unknown }[] => {
  if (host.inactiveValuesCache && !host.inactiveValuesDirty)
    return host.inactiveValuesCache;
  const values: InactiveSlotCandidate[] = [];
  collectHostSlotValues(
    host,
    getSlotOrder(host.parent, host.name, host.blueprintNode),
    values,
  );
  values.sort(
    (left, right) =>
      compareSlotOrder(left.order, right.order) ||
      (left.entry.path < right.entry.path
        ? -1
        : left.entry.path > right.entry.path
          ? 1
          : 0),
  );
  const chosen = new Map<string, Readonly<{ path: string; value: unknown }>>();
  for (const candidate of values)
    if (!chosen.has(candidate.entry.path))
      chosen.set(candidate.entry.path, candidate.entry);
  const next = [...chosen.values()];
  const previous = host.inactiveValuesCache;
  host.inactiveValuesDirty = false;
  if (
    previous?.length === next.length &&
    (() => {
      const items = previous;
      for (
        let position = 0, count = items.length;
        position < count;
        position++
      ) {
        if (!(position in items)) continue;
        const entry = items[position];
        const index = position;
        if (!(entry === next[index])) return false;
      }
      return true;
    })()
  )
    return previous;
  return (host.inactiveValuesCache = next.length
    ? Object.freeze(next)
    : EMPTY_VALUES);
};
