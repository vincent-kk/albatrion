import type { InstanceIdRegistrations } from './instanceIdRegistrationsOf';
import type { SchemaRootRegistration } from './registerSchemaRoot';

/**
 * Remove one owned weak slot while preserving the moved registration's position.
 * @param ledger - Weak slots and cleanup cursor owned by the exact application instance.
 * @param index - Existing position already selected by its owner or the bounded prune cursor.
 * @param registration - Payload already read from that slot, absent when collected; its position is cleared.
 * @returns Nothing; updates only plugin metadata and keeps the cleanup cursor in bounds.
 */
export const removeRootRegistration = (
  ledger: Pick<InstanceIdRegistrations, 'active' | 'cursor'>,
  index: number,
  registration: SchemaRootRegistration | undefined,
): void => {
  const last = ledger.active.length - 1;
  ledger.active[index] = ledger.active[last];
  ledger.active.pop();
  if (registration) registration.slot = undefined;
  if (index !== last) {
    const moved = ledger.active[index].deref();
    if (moved) moved.slot = index;
  }
  ledger.cursor = ledger.active.length
    ? (ledger.cursor ?? 0) % ledger.active.length
    : 0;
};
