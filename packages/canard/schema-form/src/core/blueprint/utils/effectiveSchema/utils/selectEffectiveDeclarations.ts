import type { BlueprintNode, PropertyDeclaration } from '../../../type';

/**
 * Select effective contributions without executing their gate descriptions.
 * @param node - Owner of declarations and overlays.
 * @param activeIds - Gated IDs selected by the settlement caller.
 * @returns Contributions in authored total order, omitting shared disjunctive hints.
 */
export const selectEffectiveDeclarations = (
  node: BlueprintNode,
  activeIds: readonly number[],
): PropertyDeclaration[] => {
  const active = node.declarations.filter(
    (entry) =>
      !entry.validationOnly &&
      (entry.gates.length === 0 || activeIds.includes(entry.id)),
  );
  const declarations = active.filter((entry) => entry.role === 'declaration');
  return active
    .filter(
      (entry) =>
        entry.context === 'conjunction' ||
        (declarations.length === 1 &&
          declarations[0].context === 'declaration' &&
          entry === declarations[0]),
    )
    .sort(compareDeclarations);
};

/**
 * Compare keyword/index paths independently of object insertion order.
 * @param left - Earlier candidate in the sort comparison.
 * @param right - Later candidate in the sort comparison.
 * @returns Signed ordering, using declaration IDs only for equal paths.
 */
function compareDeclarations(
  left: PropertyDeclaration,
  right: PropertyDeclaration,
): number {
  const length = Math.min(left.order.length, right.order.length);
  for (let index = 0; index < length; index++) {
    const difference = left.order[index] - right.order[index];
    if (difference) return difference;
  }
  return left.order.length - right.order.length || left.id - right.id;
}
