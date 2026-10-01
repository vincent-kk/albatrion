import { SchemaNodeEventType } from '../../../record';
import type { SchemaNodeRecord } from '../../../record';

/**
 * Read the sum of commit counts for the selected event bits.
 * @param node - Occurrence carrying its own per-bit ledger
 * @param mask - Selected bits; omitted means all known bits
 * @returns Monotone count independent of listener presence
 */
export const readSchemaNodeRevision = <Self extends SchemaNodeRecord<Self>>(
  node: Self, mask = Number.MAX_SAFE_INTEGER,
): number => {
  let revision = 0;
  for (let bit = 1; bit <= SchemaNodeEventType.UpdateDiagnostics; bit *= 2)
    if (mask & bit) revision += node.revisionLedger[bit] ?? 0;
  return revision;
};
