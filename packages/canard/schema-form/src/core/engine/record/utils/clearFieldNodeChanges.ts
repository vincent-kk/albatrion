import { BIT_MASK_NONE } from '@/schema-form/constants/bitmask';

import { FieldNodeEventType } from '../constants/FieldNodeEventType';
import type { FieldNodeRecord } from '../types/record';

/**
 * Release only the baseline slots used by the completed commit.
 * @param node - Record whose facts have been compared or discarded on exit
 * @returns Nothing; revision and already-built wave payloads remain untouched
 */
export const clearFieldNodeChanges = <Self>(
  node: FieldNodeRecord<Self>,
): void => {
  const changes = node.__deliveryChanges__;
  if (changes & FieldNodeEventType.UpdateValue) {
    node.__deliveryPreviousValue__ = undefined;
    node.__deliveryPreviousOutputValue__ = undefined;
  }
  if (changes & FieldNodeEventType.UpdatePath)
    node.__deliveryPreviousPath__ = undefined;
  if (changes & FieldNodeEventType.UpdateChildren)
    node.__deliveryPreviousChildren__ = undefined;
  if (changes & FieldNodeEventType.UpdateControlledProperties)
    node.__deliveryPreviousComputedBits__ = undefined;
  if (changes & FieldNodeEventType.UpdateJsonSchema)
    node.__deliveryPreviousSchema__ = undefined;
  if (changes & FieldNodeEventType.UpdateState)
    node.__deliveryPreviousState__ = undefined;
  node.__deliveryChanges__ = BIT_MASK_NONE;
};
