import type { FieldNodeRuntime } from '../../../../../record';
import type { InactiveMemoChange } from '../../../../types/inactiveValues';
import { EMPTY_VALUES } from '../../../detached/emptyDetachedReads';
import { findInactivePosition } from './findInactivePosition';

/**
 * Copy each affected list once, remove old items, then insert replacements.
 * @param runtime - Root publications and weak sort positions
 * @param changes - Only paths whose selected value, kind or order changed
 * @returns Nothing; untouched lists and retained items keep identity
 */
export const updateInactiveHostLists = <Self>(
  runtime: FieldNodeRuntime<Self>,
  changes: readonly InactiveMemoChange[],
): void => {
  if (!changes.length) return;
  const lists = new Map<string, { path: string; value: unknown }[]>();
  const orders = runtime.inactiveValueOrders!;
  for (const { previous, next } of changes) {
    let host = (previous ?? next)!.entry.path;
    while (true) {
      let list = lists.get(host);
      if (!list) {
        list = runtime.inactiveValuesMemo.get(host)?.slice() ?? [];
        lists.set(host, list);
      }
      if (previous) {
        const index = findInactivePosition(
          list,
          previous.entry.path,
          previous.order,
          orders,
        );
        list.splice(index, 1);
      }
      if (!host) break;
      host = host.slice(0, host.lastIndexOf('/'));
    }
  }
  for (const { previous, next } of changes)
    if (previous && previous.entry !== next?.entry)
      orders.delete(previous.entry);
  for (const { next } of changes) {
    if (!next) continue;
    orders.set(next.entry, next.order);
    let host = next.entry.path;
    while (true) {
      const list = lists.get(host)!;
      const index = findInactivePosition(
        list,
        next.entry.path,
        next.order,
        orders,
      );
      list.splice(index, 0, next.entry);
      if (!host) break;
      host = host.slice(0, host.lastIndexOf('/'));
    }
  }
  for (const [host, list] of lists) {
    const previous = runtime.inactiveValuesMemo.get(host);
    if (
      previous &&
      previous.length === list.length &&
      previous.every((entry, index) => entry === list[index])
    )
      continue;
    if (list.length) runtime.inactiveValuesMemo.set(host, Object.freeze(list));
    else if (!host) runtime.inactiveValuesMemo.set('', EMPTY_VALUES);
    else runtime.inactiveValuesMemo.delete(host);
  }
};
