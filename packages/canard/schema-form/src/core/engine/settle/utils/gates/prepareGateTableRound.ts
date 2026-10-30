import { map as mapArray } from '@winglet/common-utils/array';

import type { Nullable } from '@aileron/declare';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import { getHostDerived } from '../../../utils/cache/derivedRecords';
import { engineModes } from '../../../utils/cache/engineModes';
import type { SettlementContext } from '../../types/settlement';
import { getGateSelectionTable } from '../compute/childSelection/getGateSelectionTable';
import { watchGateSelectionDirty } from './watchGateSelectionDirty';

/** No per-round allocation when a table has no constraint-only tag schema. */
const NO_SCHEMA_PATHS: readonly string[] = Object.freeze([]);

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
  for (
    let ancestor: Nullable<Self> = node;
    ancestor;
    ancestor = ancestor.parent
  )
    if (ancestor.raw !== undefined) return;
  const table = getGateSelectionTable(
    node.blueprintNode,
    node.runtime.blueprint,
  );
  if (!table) return;
  const watchedPaths = mapArray(table.watchedNames, (name) =>
    appendSegment(node.path, name),
  );
  let hasDirtyWatchedPath = false;
  for (let index = 0, count = watchedPaths.length; index < count; index++) {
    const path = watchedPaths[index];

    if (context.dirtyPaths.has(path)) {
      hasDirtyWatchedPath = true;
      break;
    }
  }
  if (hasDirtyWatchedPath) {
    return;
  }
  (context.gateSelectionRounds ??= new Map()).set(node, {
    round,
    table,
    values: new Map(),
    watchedPaths,
    stableSchemaPaths: table.stableSchemaNames.length
      ? mapArray(table.stableSchemaNames, (name) =>
          appendSegment(node.path, name),
        )
      : NO_SCHEMA_PATHS,
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
