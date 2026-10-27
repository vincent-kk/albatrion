import { escapeSegment } from '@winglet/json/pointer';

import type { FieldNodeRecord } from '../../../record';
import { getHostDerived } from '../../../utils/cache/derivedRecords';
import { engineModes } from '../../../utils/cache/engineModes';
import type { SettlementContext } from '../../types/settlement';
import { getGateSelectionTable } from '../compute/childSelection/getGateSelectionTable';
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
    engineModes.gateSelection === 'off' ||
    (context.kind === 'load' &&
      !getHostDerived(node.blueprintNode).directChildSelectionPlan) ||
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
  const watchedPaths = table.watchedNames.map(
    (name) => node.path + '/' + escapeSegment(name),
  );
  if (watchedPaths.some((path) => context.dirtyPaths.has(path))) return;
  (context.gateSelectionRounds ??= new Map()).set(node, {
    round,
    table,
    values: new Map(),
    watchedPaths,
    stableSchemaPaths: table.stableSchemaNames.map(
      (name) => node.path + '/' + escapeSegment(name),
    ),
    active: true,
  });
  if (engineModes.gateSelection === 'verify') {
    if (context.gateWheelFrame)
      context.gateWheelFrame.selectionShadow = {
        inputs: new Map(),
        consistent: true,
      };
    watchGateSelectionDirty(context);
  }
};
