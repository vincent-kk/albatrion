import type { FieldNodeRecord } from '../../../../record';
import { isSameDeliveryValue } from './isSameDeliveryValue';

/**
 * Match the last emitted input to its live, unmoved committed occurrence.
 * @param relays - Input records consumed by this settlement
 * @param path - Changed source path under consideration for Refresh
 * @returns Whether delivery-value identity permits omitting this Refresh
 */
export const isRelayedInput = <Self extends FieldNodeRecord<Self>>(
  relays: readonly { node: Self; path: string; value: unknown }[],
  path: string,
): boolean =>
  relays.some(
    (relay) =>
      relay.path === path &&
      relay.node.path === path &&
      !relay.node.detached &&
      !relay.node.disposed &&
      isSameDeliveryValue(relay.node.local, relay.value),
  );
