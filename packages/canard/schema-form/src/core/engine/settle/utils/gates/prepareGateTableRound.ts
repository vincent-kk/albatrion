import { escapeSegment } from '@winglet/json/pointer';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { DIRECT_CHILD_SELECTION_PLANS } from '../compute/childSelection/getDirectChildSelectionPlan';
import { getGateSelectionTable } from '../compute/childSelection/getGateSelectionTable';
import { gateSelectionTable } from './gateSelectionTable';
import { watchGateSelectionDirty } from './watchGateSelectionDirty';

/**
 * Decide G1–G4 once before either root declarations or children execute this round.
 * @param node - Host occurrence after the fixed baseline and initial dirty children
 * @param context - Settlement retaining values only until this round finishes
 * @param round - Current host wheel counter, scoped to this computation
 * @returns Nothing; absence from the map means the complete round uses full evaluation
 */
export const prepareGateTableRound = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  round: number,
): void => {
  context.gateSelectionRounds?.delete(node);
  if (
    gateSelectionTable.mode === 'off' ||
    (context.kind === 'load' &&
      !DIRECT_CHILD_SELECTION_PLANS.get(node.blueprintNode)) ||
    !context.hasGates ||
    node.behavior.type !== 'object'
  )
    return;
  for (let ancestor: Self | null = node; ancestor; ancestor = ancestor.parent)
    if (ancestor.raw !== undefined) return;
  const table = getGateSelectionTable(
    node.blueprintNode,
    node.runtime.blueprint,
  );
  if (!table) return;
  const watchedPaths = table.groups.map(
    (group) => node.path + '/' + escapeSegment(group.watchedName),
  );
  if (watchedPaths.some((path) => context.dirtyPaths.has(path))) return;
  (context.gateSelectionRounds ??= new Map()).set(node, {
    round,
    table,
    values: new Map(),
    watchedPaths,
    active: true,
  });
  if (gateSelectionTable.mode === 'verify') {
    if (context.gateWheelFrame)
      context.gateWheelFrame.selectionShadow = {
        inputs: new Map(),
        consistent: true,
      };
    watchGateSelectionDirty(context);
  }
};
