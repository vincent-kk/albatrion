import {
  EXTERNAL_VALUE_REVISION,
  INPUT_VALUE_REVISION,
} from '@/schema-form/constants/externalValueRevision';

import {
  EMPTY_REVISION_LEDGER,
  FieldNodeEventType,
  FieldNodeRevisionLedger,
} from '../../../record';
import type { FieldNodeRecord } from '../../../record';

/**
 * Read the sum of commit counts for the selected event bits.
 * @param node - Occurrence carrying its own per-bit ledger
 * @param mask - Selected bits; omitted means all known bits
 * @returns Monotone count independent of listener presence
 */
export const readFieldNodeRevision = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  mask = (FieldNodeEventType.UpdateDiagnostics << 1) - 1,
): number => {
  node.runtime.isRevisionObserved = true;
  const ledger = node.__revisionLedger__;
  if (ledger === EMPTY_REVISION_LEDGER) return 0;
  let revision = 0;
  const isLedger = ledger instanceof FieldNodeRevisionLedger;
  if (mask & EXTERNAL_VALUE_REVISION) {
    mask &= ~EXTERNAL_VALUE_REVISION;
    if (node.behavior.strategy === 'branch')
      revision = isLedger
        ? ledger.readExternalValue()
        : (ledger[FieldNodeEventType.UpdateValue] ?? 0) -
          (ledger[INPUT_VALUE_REVISION] ?? 0);
  }
  if (isLedger) return revision + ledger.read(mask);
  for (let bit = 1; bit <= FieldNodeEventType.UpdateDiagnostics; bit *= 2)
    if (mask & bit) revision += ledger[bit] ?? 0;
  return revision;
};
