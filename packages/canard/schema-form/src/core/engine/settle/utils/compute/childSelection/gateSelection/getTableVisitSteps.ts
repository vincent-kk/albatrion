import { unescapeSegment } from '@winglet/json/pointer';

import type { FieldNodeRecord } from '../../../../../record';
import { getBlueprintNodeIdentity } from '../../../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { GateSelectionTable } from '../../../../types/gateSelectionTable';
import { isPlain } from '../../../input/isPlain';
import type { ChildSelectionFrame } from '../selectEntryStep';
import { mergeGateSteps } from './mergeGateSteps';

/**
 * Collect the always-visited steps and R1–R4 without scanning inactive declarations.
 * @param frame - Round-entry prior, structure and distributed caller input
 * @param table - Unique-name plan and host-owned pending-exit index metadata
 * @returns Sorted baseline/unsupported and cleanup steps; active buckets are merged at their read sites
 */
export const getTableVisitSteps = <Self extends FieldNodeRecord<Self>>(
  frame: ChildSelectionFrame<Self>,
  table: GateSelectionTable,
): number[] => {
  const { node, context, prior, next } = frame;
  const required: number[] = [];
  for (const name of Object.keys(prior)) {
    const index = table.stepIndexByName.get(name);
    if (
      index !== undefined &&
      prior[name].blueprintNode === table.plan.steps[index].entry.node
    )
      required.push(index);
  }
  for (const name of Object.keys(next)) {
    const index = table.stepIndexByName.get(name);
    if (index !== undefined) required.push(index);
  }
  for (const path of context.pendingExitPaths?.get(node.path)?.keys() ?? []) {
    const name = unescapeSegment(path.slice(path.lastIndexOf('/') + 1));
    const index = table.stepIndexByName.get(name);
    if (
      index !== undefined &&
      context.pendingExits.has(
        JSON.stringify([
          path,
          getBlueprintNodeIdentity(table.plan.steps[index].entry.node),
        ]),
      )
    )
      required.push(index);
  }
  const input = context.distributedInputs.get(node)?.input;
  if (isPlain(input))
    for (const name of Object.getOwnPropertyNames(input)) {
      const index = table.stepIndexByName.get(name);
      if (index !== undefined) required.push(index);
    }
  required.sort((a, b) => a - b);
  return mergeGateSteps(table.alwaysSteps, required);
};
