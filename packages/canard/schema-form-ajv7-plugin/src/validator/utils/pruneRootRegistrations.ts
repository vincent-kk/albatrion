import type { InstanceIdRegistrations } from './instanceIdRegistrationsOf';
import { removeRootRegistration } from './removeRootRegistration';

/**
 * Prune a bounded slice of weak registrations without scanning all live forms.
 * @param ledger - Shared weak slots and the next cleanup position, defaulting to zero.
 * @returns Nothing; dead or released slots are removed and the cursor remains in bounds.
 */
export const pruneRootRegistrations = (
  ledger: Pick<InstanceIdRegistrations, 'active' | 'cursor'>,
): void => {
  const limit = Math.min(2, ledger.active.length);
  for (
    let inspected = 0;
    inspected < limit && ledger.active.length;
    inspected++
  ) {
    const index = (ledger.cursor ?? 0) % ledger.active.length;
    const entry = ledger.active[index].deref();
    if (entry && !entry.released) ledger.cursor = index + 1;
    else {
      ledger.cursor = index;
      removeRootRegistration(ledger, index, entry);
    }
  }
  ledger.cursor = ledger.active.length
    ? (ledger.cursor ?? 0) % ledger.active.length
    : 0;
};
