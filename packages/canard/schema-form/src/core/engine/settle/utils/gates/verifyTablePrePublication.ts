import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { flushPendingGateReads } from './flushPendingGateReads';
import { verifyGateSelection } from './verifyGateSelection';

/**
 * Verify that a table step's load publication cannot change the state before its read.
 * Keep shadow publication-call counts unchanged; this S2′-style check is skip-only.
 * @param node - Eligible host whose baseline terminal is already in its structure
 * @param context - Verify-mode skip load with pending outputs before the authored gate site
 * @param entry - Table step whose inherited gate reads that baseline terminal
 * @returns Nothing; checks both ordered sets and throws if publication has an effect
 */

export const verifyTablePrePublication = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  entry: BlueprintChildEntry,
): void => {
  const path = appendSegment(node.path, entry.name);
  const pending = [...context.pendingOutputs!];
  const changed = [...context.changedNodes];
  flushPendingGateReads(entry.node, path, context);
  const afterPending = [...(context.pendingOutputs ?? [])];
  const afterChanged = [...context.changedNodes];
  let matches = pending.length === afterPending.length;
  if (matches) {
    matches = true;
    for (let index = 0, count = pending.length; index < count; index++) {
      const host = pending[index];

      if (!(host === afterPending[index])) {
        matches = false;
        break;
      }
    }
  }
  let matches2 = matches && changed.length === afterChanged.length;
  if (matches2) {
    matches2 = true;
    for (let index = 0, count = changed.length; index < count; index++) {
      const host = changed[index];

      if (!(host === afterChanged[index])) {
        matches2 = false;
        break;
      }
    }
  }
  verifyGateSelection(matches2, 'S2 table pre-publication: ' + path);
};
