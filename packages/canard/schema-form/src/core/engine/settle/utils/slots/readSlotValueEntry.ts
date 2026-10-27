import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { sameValue } from '../../../utils/compute/sameValue';

/**
 * Reuse an item's identity only within its unchanged inactive source lifetime.
 * @param source - Retained occurrence whose memo is absent on active clones
 * @param overlay - Input-only memo owner when no instance has existed
 * @param path - Absolute published address, independent of a frozen source path
 * @param value - Materialized source value
 * @param composed - Whether an array was newly assembled from unchanged channels
 * @returns Frozen item with stable value and item references between changes
 */
export const readSlotValueEntry = <Self extends FieldNodeRecord<Self>>(
  source: Self | undefined,
  overlay: InactiveSlotOverlay | undefined,
  path: string,
  value: unknown,
  composed = false,
): Readonly<{ path: string; value: unknown }> => {
  const prior = source?.inactiveValueMemo ?? overlay?.valueMemo;
  if (prior && composed && sameValue(prior.value, value)) value = prior.value;
  if (prior?.path === path && Object.is(prior.value, value)) return prior.entry;
  const memo = { path, value, entry: Object.freeze({ path, value }) };
  if (source) source.inactiveValueMemo = memo;
  else if (overlay) overlay.valueMemo = memo;
  return memo.entry;
};
