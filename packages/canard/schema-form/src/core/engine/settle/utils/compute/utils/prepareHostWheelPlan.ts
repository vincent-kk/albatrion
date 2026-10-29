import { HostStaticPartition } from '../../../../blueprint';
import type { Blueprint, BlueprintGate } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import { getHostDerived } from '../../../../utils/cache/derivedRecords';
import { getGateExpression } from '../../gates/getGateExpression';
import type { GateOccurrence } from '../../gates/type';
import { relocatedGates } from '../relocatedGates';
import { getStaticGateList } from './getStaticGateList';

/** Host identity owns only preparation metadata, never predicate inputs/results. */
export interface HostWheelPlan {
  readonly blueprint: Blueprint;
  readonly path: string;
  readonly itemCount: number;
  readonly relocated: readonly GateOccurrence[];
  readonly gates: readonly BlueprintGate[];
  cap?: number;
  readonly baselineEligible: boolean;
}

/**
 * Prepare immutable wheel metadata once until this live host's locations change.
 * @param node - Live branch host; arrays also invalidate when their count changes
 * @param previous - This wheel's accumulated gates, retained across late relocation
 * @returns Stable plan, with no gate-list enumeration on an unchanged occurrence
 */
export const prepareHostWheelPlan = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  previous?: HostWheelPlan,
): HostWheelPlan => {
  const record = getHostDerived<'wheelPlan', HostWheelPlan>(node);
  const cached = previous ?? record.wheelPlan;
  const relocated = relocatedGates(node);
  if (
    cached &&
    (previous !== undefined || node.behavior.type === 'object') &&
    cached.blueprint === node.runtime.blueprint &&
    cached.path === node.path &&
    cached.itemCount === node.itemCount &&
    cached.relocated === relocated
  )
    return cached;
  const list = getStaticGateList(node);
  let gates = previous?.gates ?? list.gates;
  if (relocated.length) {
    const collected = [...gates];
    const seen = new Set(gates);
    for (const occurrence of relocated)
      if (!seen.has(occurrence.gate)) {
        seen.add(occurrence.gate);
        collected.push(occurrence.gate);
      }
    gates = collected;
  }
  const partition = HostStaticPartition.get(node.blueprintNode);
  let matches =
    gates.length > 0 &&
    node.behavior.type === 'object' &&
    relocated.length === 0 &&
    !partition.hasGatedOverlays &&
    partition.staticEntries.length > 0;
  if (matches) {
    for (let index = 0, count = gates.length; index < count; index++) {
      const gate = gates[index];

      if (
        !getGateExpression(node.runtime.blueprint, gate.schemaPath)?.equality
      ) {
        matches = false;
        break;
      }
    }
  }
  const plan: HostWheelPlan = {
    blueprint: node.runtime.blueprint,
    path: node.path,
    itemCount: node.itemCount,
    relocated,
    gates,
    baselineEligible: matches,
  };
  if (!previous) record.wheelPlan = plan;
  return plan;
};
