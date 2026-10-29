import { readPointerSegment } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintGate } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { engineModes } from '../../../utils/cache/engineModes';
import type { SettlementContext } from '../../types/settlement';
import { evaluateGate } from './evaluateGate';
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
  if (
    (() => {
      const items =
        context.gateSelectionRounds!.get(node)!.table.predicateGroups;
      for (let index = 0, count = items.length; index < count; index++) {
        if (!(index in items)) continue;
        const group = items[index];
        if (group.gate === gate) return true;
      }
      return false;
    })()
  ) {
    verifyGateSelection(
      evaluateGate(gate, context, node, undefined, true) === value,
      'S1 predicate verdict: ' + gate.schemaPath,
    );
    return;
  }
  if (engineModes.gateSelection === 'verify') {
    const round = context.gateSelectionRounds!.get(node)!;
    const registry = getGateRegistry(node.runtime);
    const path = registry.locate(node, gate).watchPaths[0];
    const name = readPointerSegment(path, -1);
    if (typeof name !== 'string')
      throw new TypeError('Expected a named node path');
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
        (() => {
          const items = pending;
          for (let index = 0, count = items.length; index < count; index++) {
            if (!(index in items)) continue;
            const entry = items[index];
            if (!context.pendingOutputs!.has(entry)) return false;
          }
          return true;
        })(),
      'S2 pendingOutputs changed: ' + path,
    );
    verifyGateSelection(
      changed.length === context.changedNodes.size &&
        (() => {
          const items = changed;
          for (let index = 0, count = items.length; index < count; index++) {
            if (!(index in items)) continue;
            const entry = items[index];
            if (!context.changedNodes.has(entry)) return false;
          }
          return true;
        })(),
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
