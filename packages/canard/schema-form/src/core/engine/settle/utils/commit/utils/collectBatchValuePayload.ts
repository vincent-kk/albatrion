import { pendingBatchValuePayloads } from '../../../../record';
import type { FieldNodeRecord } from '../../../../record';

/**
 * Keep one unpublished payload for a node throughout a structural batch.
 * @param node - Record whose current commit supplies the latest value.
 * @param pending - Existing pending value payload, including its first previous.
 * @returns The owned payload reused until the outer batch closes.
 */
export const collectBatchValuePayload = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  pending: unknown,
): { previous: unknown; current: unknown } => {
  const owned =
    pending !== null && typeof pending === 'object'
      ? pendingBatchValuePayloads.get(pending)
      : undefined;
  if (owned) {
    if (
      node.behavior.strategy === 'branch' &&
      owned.current !== null &&
      typeof owned.current === 'object'
    ) {
      Reflect.set(owned.current, 'value', node.storedValue);
      Reflect.set(owned.current, 'outputValue', node.storedOutputValue);
    } else owned.current = node.storedValue;
    return owned;
  }
  const previous = !node.isDeliveryInitialized
    ? undefined
    : pending !== null && typeof pending === 'object'
      ? Reflect.get(pending, 'previous')
      : node.behavior.strategy === 'branch'
        ? {
            value: node.deliveryPreviousValue,
            outputValue: node.deliveryPreviousOutputValue,
          }
        : node.deliveryPreviousValue;
  const current =
    node.behavior.strategy === 'branch'
      ? { value: node.storedValue, outputValue: node.storedOutputValue }
      : node.storedValue;
  const payload = { previous, current };
  pendingBatchValuePayloads.set(payload, payload);
  return payload;
};
