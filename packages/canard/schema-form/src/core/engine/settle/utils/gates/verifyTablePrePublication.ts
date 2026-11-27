import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { flushPendingGateReads } from './flushPendingGateReads';
import { verifyGateSelection } from './verifyGateSelection';

/**
 * Verify that a table step's load publication adds no node to `changedNodes`.
 * Publishing removes hosts from `pendingOutputs` by design, so that set is not compared:
 * an `if` or discriminator gate flushes its whole host even when nothing new changes.
 * Keep shadow publication-call counts unchanged; this S2′-style check is skip-only.
 * @param node - Eligible host whose baseline terminal is already in its structure
 * @param context - Verify-mode skip load with pending outputs before the authored gate site
 * @param entry - Table step whose inherited gate reads that baseline terminal
 * @returns Nothing; throws if publication changes the `changedNodes` sequence
 */
export const verifyTablePrePublication = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  entry: BlueprintChildEntry,
): void => {
  const path = appendSegment(node.path, entry.name);
  const changed = [...context.changedNodes];
  flushPendingGateReads(entry.node, path, context);
  const afterChanged = [...context.changedNodes];
  let matches = changed.length === afterChanged.length;
  for (let index = 0; matches && index < changed.length; index++)
    matches = changed[index] === afterChanged[index];
  verifyGateSelection(matches, 'S2 table pre-publication: ' + path);
};
