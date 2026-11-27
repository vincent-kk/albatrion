import { HostStaticPartition } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import { getGateExpression } from '../../gates/getGateExpression';
import { relocatedGates } from '../relocatedGates';
import { getStaticGateList } from './getStaticGateList';

/** Host identity owns only preparation metadata, never predicate inputs/results; the record declares its shape. */
export type HostWheelPlan = NonNullable<
  FieldNodeRecord<unknown>['__wheelPlan__']
>;

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
  const cached = previous ?? node.__wheelPlan__;
  const relocatedOccurrences = relocatedGates(node);
  if (
    cached &&
    (previous !== undefined || node.behavior.type === 'object') &&
    cached.blueprint === node.runtime.blueprint &&
    cached.path === node.path &&
    cached.itemCount === node.__itemCount__ &&
    cached.relocatedOccurrences === relocatedOccurrences
  )
    return cached;
  const list = getStaticGateList(node);
  let gates = previous?.gates ?? list.gates;
  if (relocatedOccurrences.length) {
    const collected = [...gates];
    const seen = new Set(gates);
    for (const occurrence of relocatedOccurrences)
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
    relocatedOccurrences.length === 0 &&
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
    itemCount: node.__itemCount__,
    relocatedOccurrences,
    gates,
    isBaselineEligible: matches,
  };
  if (!previous) node.__wheelPlan__ = plan;
  return plan;
};
