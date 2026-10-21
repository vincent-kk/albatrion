import type {
  Blueprint,
  BlueprintGate,
  BlueprintNode,
} from '../../../../../blueprint';
import type {
  GateSelectionGroup,
  GateSelectionLiteral,
  GateSelectionTable,
  RootGateSelectionGroup,
} from '../../../../types/gateSelectionTable';

/**
 * Construct E5 declaration buckets only when every root condition is a table gate.
 * @param host - Host identity, which must be the owning blueprint root
 * @param blueprint - Immutable analysis defining that root identity
 * @param groups - Completed child-selection groups with per-gate literal evidence
 * @returns Root metadata or undefined for a partial or non-root declaration surface
 */
export const computeRootGateSelection = (
  host: BlueprintNode,
  blueprint: Blueprint,
  groups: readonly GateSelectionGroup[],
): GateSelectionTable['root'] => {
  if (host !== blueprint.root) return;
  const groupByGate = new Map<BlueprintGate, GateSelectionGroup>();
  for (const group of groups)
    for (const gate of group.literalsByGate.keys())
      groupByGate.set(gate, group);
  const ungatedIndices: number[] = [];
  const rootGroups = new Map<
    string,
    Omit<RootGateSelectionGroup, 'buckets'> & {
      buckets: Map<GateSelectionLiteral, number[]>;
    }
  >();
  for (let index = 0; index < host.declarations.length; index++) {
    const gates = host.declarations[index].gates;
    if (gates.length === 0) {
      ungatedIndices.push(index);
      continue;
    }
    if (gates.length !== 1 || gates[0].appliesWhen?.length) return;
    const gate = gates[0];
    const group = groupByGate.get(gate);
    if (!group) return;
    let rootGroup = rootGroups.get(group.watchedName);
    if (!rootGroup) {
      rootGroup = {
        watchedName: group.watchedName,
        firstGate: gate,
        buckets: new Map(),
      };
      rootGroups.set(group.watchedName, rootGroup);
    }
    for (const literal of group.literalsByGate.get(gate)!) {
      const bucket = rootGroup.buckets.get(literal);
      if (bucket) bucket.push(index);
      else rootGroup.buckets.set(literal, [index]);
    }
  }
  return { ungatedIndices, groups: [...rootGroups.values()] };
};
