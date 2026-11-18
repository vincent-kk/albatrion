import {
  FieldNodeEventType,
  pendingBatchValuePayloads,
} from '../../../../record';
import type { FieldNodeRecord } from '../../../../record';

/**
 * End private mutation before any structural-batch event reaches its listeners.
 * @param root - Current root retaining the already-collected delivery set.
 * @returns Nothing; only owned value payloads lose their mutable ownership.
 */
export const sealBatchValuePayloads = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): void => {
  for (const node of root.runtime.deliveries ?? []) {
    const payload =
      node.pendingDelivery?.payload?.[FieldNodeEventType.UpdateValue];
    if (
      payload !== null &&
      typeof payload === 'object' &&
      pendingBatchValuePayloads.delete(payload)
    )
      if (process.env.NODE_ENV !== 'production') Object.freeze(payload);
  }
};
