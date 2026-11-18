import { INPUT_VALUE_REVISION } from '@/schema-form/constants/externalValueRevision';

import { FieldNodeRevisionLedger } from './FieldNodeRevisionLedger';

/** The factory and reader share input counts by weak immutable ledger identity. */
const inputRevisions = new WeakMap<Readonly<Record<number, number>>, number>();

/**
 * Preserve public counters and carry only needed own-input metadata to the next ledger.
 * @param previous - Last committed ledger, including the shared empty object.
 * @param mask - Public event bits and an optional own-input value bit committed together.
 * @returns A new immutable ledger; previous counters and metadata remain unchanged.
 */
export const createFieldNodeRevisionLedger = (
  previous: Readonly<Record<number, number>>,
  mask: number,
): FieldNodeRevisionLedger => {
  const ledger = new FieldNodeRevisionLedger(previous, mask);
  const inputRevision =
    (inputRevisions.get(previous) ?? 0) + (mask & INPUT_VALUE_REVISION ? 1 : 0);
  if (inputRevision) inputRevisions.set(ledger, inputRevision);
  return ledger;
};

/**
 * Read the input-owned portion of an immutable value revision.
 * @param ledger - Committed ledger whose own-input metadata may be absent.
 * @returns Its input-owned commit count, or zero without allocating metadata.
 */
export const readFieldNodeInputRevision = (
  ledger: Readonly<Record<number, number>>,
): number => inputRevisions.get(ledger) ?? 0;
