import { vi } from 'vitest';

import type { BlueprintNode } from '../../../blueprint';
import * as derived from '../../../utils/cache/derivedRecords';
import type { HostDerived } from '../../../utils/cache/derivedRecords';

/** Observe real property writes after an internal cache moves out of WeakMap.set. */
export const observeHostSlotWrites = (slot: keyof HostDerived) => {
  const writes = vi.fn<(host: BlueprintNode, value: unknown) => void>();
  const observed = new WeakSet<object>();
  const original = derived.getHostDerived;
  vi.spyOn(derived, 'getHostDerived').mockImplementation(((host: object) => {
    const record = original(host);
    if (!observed.has(record)) {
      observed.add(record);
      const descriptor = Object.getOwnPropertyDescriptor(record, slot);
      let value = record[slot];
      Object.defineProperty(record, slot, {
        configurable: true,
        enumerable: descriptor?.enumerable ?? false,
        get: () => value,
        set: (next: unknown) => {
          value = next;
          Object.defineProperty(record, slot, { enumerable: true });
          writes(host as BlueprintNode, next);
        },
      });
    }
    return record;
  }) as typeof derived.getHostDerived);
  return writes;
};
