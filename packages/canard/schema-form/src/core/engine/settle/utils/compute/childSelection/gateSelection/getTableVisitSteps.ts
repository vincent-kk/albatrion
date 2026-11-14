import { readPointerSegment } from '@/schema-form/helpers/jsonPointer';

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
  const prepared = frame.preparedStatic;
  for (const name of frame.priorDynamicNames ?? Object.keys(prior)) {
    const index = table.stepIndexByName.get(name);
    if (
      index !== undefined &&
      prior[name].blueprintNode === table.plan.steps[index].entry.node
    )
      required.push(index);
  }
  for (const name of prepared ? prepared.dynamicNames : Object.keys(next)) {
    if (!next[name]) continue;
    const index = table.stepIndexByName.get(name);
    if (index !== undefined) required.push(index);
  }
  for (const path of context.pendingExitPaths?.get(node.path)?.keys() ?? []) {
    const name = readPointerSegment(path, -1);
    if (typeof name !== 'string')
      throw new TypeError('Expected a named node path');
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
  return mergeGateSteps(prepared?.alwaysSteps ?? table.alwaysSteps, required);
};
