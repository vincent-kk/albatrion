import { compareInactiveOrder } from './compareInactiveOrder';

/**
 * Locate a selected path without scanning unrelated inactive entries.
 * @param list - Mutable sorted copy of one affected host's publication
 * @param path - Selected public path to insert or remove
 * @param order - Its document position before removal or after insertion
 * @param orders - Weak positions of already-published item objects
 * @returns Lower-bound index in the host list
 */
export const findInactivePosition = (
  list: readonly Readonly<{ path: string; value: unknown }>[],
  path: string,
  order: readonly number[],
  orders: WeakMap<object, readonly number[]>,
): number => {
  let low = 0;
  let high = list.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    const item = list[middle];
    if (compareInactiveOrder(orders.get(item)!, order, item.path, path) < 0)
      low = middle + 1;
    else high = middle;
  }
  return low;
};
