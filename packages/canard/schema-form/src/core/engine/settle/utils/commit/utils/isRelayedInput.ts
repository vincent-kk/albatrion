import { equals } from '@winglet/common-utils/object';

import type { FieldNodeRecord, FieldNodeRuntime } from '../../../../record';
import { isSameDeliveryValue } from './isSameDeliveryValue';

/**
 * Match the last emitted input to its live, unmoved committed occurrence.
 * @param relays - Input records consumed by this settlement.
 * @param path - Changed source path under consideration for Refresh.
 * @returns Whether identity, or equal reassembled array content, permits keeping the input.
 */
export const isRelayedInput = <Self extends FieldNodeRecord<Self>>(
  relays: Readonly<NonNullable<FieldNodeRuntime<Self>['inputRelays']>>,
  path: string,
): boolean => {
  for (let index = 0; index < relays.length; index++) {
    const relay = relays[index];
    if (
      relay.path === path &&
      relay.node.path === path &&
      !relay.node.isDetached &&
      !relay.node.isDisposed &&
      (isSameDeliveryValue(relay.node.storedValue, relay.value) ||
        (relay.node.behavior.type === 'array' &&
          relay.node.behavior.strategy === 'branch' &&
          equals(relay.node.storedValue, relay.value)))
    )
      return true;
  }
  return false;
};
