import { map as mapArray } from '@winglet/common-utils/array';

import type { Optional } from '@aileron/declare';

import type { BlueprintNode } from '../../../../../blueprint';
import type { FieldNodeRecord } from '../../../../../record';
import { engineModes } from '../../../../../utils/cache/engineModes';
import type { SettlementContext } from '../../../../types/settlement';
import { readGateSelectionGroup } from '../../../gates/readGateSelectionGroup';
import { verifyTableGate } from '../../../gates/verifyTableGate';
import { mergeGateSteps } from './mergeGateSteps';
import { readGateBucket } from './readGateBucket';

/**
 * Select E5 root declarations from independent watched-key groups without scanning inactive ones.
 * @param node - Root whose round was qualified together with child selection
 * @param context - Cached group values and positional verification frame
 * @returns Ordered active declarations, or undefined to retain the full-evaluation path
 */
export const selectRootGateDeclarations = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): Optional<BlueprintNode['declarations'][number][]> => {
  const round = context.gateSelectionRounds?.get(node);
  const root = round?.isActive ? round.table.root : undefined;
  if (!round || !root) return undefined;
  let selectedIndices: readonly number[] = root.ungatedIndices;
  for (const group of root.groups)
    selectedIndices = mergeGateSteps(
      selectedIndices,
      readGateBucket(
        group.buckets,
        readGateSelectionGroup(node, context, group),
      ),
    );
  if (
    engineModes.gateSelection === 'verify' ||
    engineModes.gateWheel === 'shadow'
  ) {
    const admitted = new Set(selectedIndices);
    for (
      let index = 0;
      index < node.blueprintNode.declarations.length;
      index++
    ) {
      const gate = node.blueprintNode.declarations[index].gates[0];
      if (gate) verifyTableGate(node, context, gate, admitted.has(index));
    }
  }
  return mapArray(
    selectedIndices,
    (index) => node.blueprintNode.declarations[index],
  );
};
