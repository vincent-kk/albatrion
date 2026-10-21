import { unescapeSegment } from '@winglet/json/pointer';

import type { BlueprintGate } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { gateSelectionTable } from './gateSelectionTable';
import { getGateRegistry } from './getGateRegistry';
import { readProjectedValue } from './readProjectedValue';
import { recordGateFrameInput } from './recordGateFrameInput';
import { verifyGateSelection } from './verifyGateSelection';

/**
 * Recreate the original site's read only in verify mode and retain shadow confirmation records.
 * @param node - Original evaluation owner
 * @param context - Current eligible round and witness frame
 * @param gate - Original table condition, whose Boolean verdict is already known
 * @param value - Bucket verdict recorded in the original evaluation order
 * @returns Nothing; positional S2 checks throw on the first violation
 */
export const verifyTableGate = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  gate: BlueprintGate,
  value: boolean,
): void => {
  if (gateSelectionTable.mode === 'verify') {
    const round = context.gateSelectionRounds!.get(node)!;
    const registry = getGateRegistry(node.runtime);
    const path = registry.locate(node, gate).watchPaths[0];
    const name = unescapeSegment(path.slice(path.lastIndexOf('/') + 1));
    const cached = round.values.get(name)!;
    const pending = [...(context.pendingOutputs ?? [])];
    const changed = [...context.changedNodes];
    const read = readProjectedValue(context, path);
    verifyGateSelection(
      Object.is(cached.value, read),
      'S2 positional value: ' + path,
    );
    verifyGateSelection(
      pending.length === (context.pendingOutputs?.size ?? 0) &&
        pending.every((entry) => context.pendingOutputs!.has(entry)),
      'S2 pendingOutputs changed: ' + path,
    );
    verifyGateSelection(
      changed.length === context.changedNodes.size &&
        changed.every((entry) => context.changedNodes.has(entry)),
      'S2 read published output: ' + path,
    );
    verifyGateSelection(
      !context.dirtyPaths.has(path),
      'S2 watched path dirty: ' + path,
    );
    verifyGateSelection(
      cached.occurrences === registry.occurrenceCount(node.path),
      'S2 host occurrence count changed: ' + node.path,
    );
    recordGateFrameInput(context.gateWheelFrame?.selectionShadow, {
      path,
      kind: 'value',
      value: read,
    });
  }
  context.gateWheelFrame?.evaluations?.push({
    gate,
    path: node.path,
    edgeName: undefined,
    value,
  });
};
