import type { FieldNodeRecord, FieldNodeRuntime } from '../../../../record';
import { isSameDeliveryValue } from './isSameDeliveryValue';

/**
 * Match the last emitted input to its live, unmoved committed occurrence.
 * @param relays - Input records consumed by this settlement.
 * @param path - Changed source path under consideration for Refresh.
 * @param equalArrays - Optional exact content comparator for reassembled branch arrays; omitted uses identity only.
 * @returns Whether identity, or equal reassembled array content, permits keeping the input.
 */
export const isRelayedInput = <Self extends FieldNodeRecord<Self>>(
  relays: Readonly<NonNullable<FieldNodeRuntime<Self>['inputRelays']>>,
  path: string,
  equalArrays?: (left: unknown, right: unknown) => boolean,
): boolean =>
  relays.some(
    (relay) =>
      relay.path === path &&
      relay.node.path === path &&
      !relay.node.isDetached &&
      !relay.node.isDisposed &&
      (isSameDeliveryValue(relay.node.storedValue, relay.value) ||
        (equalArrays !== undefined &&
          relay.node.behavior.type === 'array' &&
          relay.node.behavior.strategy === 'branch' &&
          equalArrays(relay.node.storedValue, relay.value))),
  );
