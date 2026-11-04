import type { FieldNodeRecord } from '../../../../record';
import { isSameDeliveryValue } from '../../commit/utils/isSameDeliveryValue';

/**
 * Check without descent that each child still emits the entry an earlier host value holds under its name.
 * @param host - Earlier host value, an object or array assembled from child emissions
 * @param children - Children whose defined emissions the host places under their names
 * @returns False when one defined emission differs from its entry by SameValueZero, otherwise true
 */
export const keepsChildEmissions = <Self extends FieldNodeRecord<Self>>(
  host: unknown,
  children: readonly Self[],
): boolean => {
  if (host === null || typeof host !== 'object') return true;
  for (const child of children) {
    const emission = child.emit;
    if (
      emission !== undefined &&
      !isSameDeliveryValue(Reflect.get(host, child.name), emission)
    )
      return false;
  }
  return true;
};
