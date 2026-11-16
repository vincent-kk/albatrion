import type { Blueprint, BlueprintNode } from '../../../../blueprint';

/**
 * Find templates that can carry conditional evidence in their live subtree.
 * @param blueprint - Immutable graph including repeated, tuple and reference edges.
 * @returns Gate-bearing templates and all their ancestors; cycles terminate by identity.
 */
export const collectConditionalTemplates = (
  blueprint: Blueprint,
): ReadonlySet<BlueprintNode> => {
  const parents = new Map<BlueprintNode, BlueprintNode[]>();
  const conditional = new Set<BlueprintNode>();
  for (const node of blueprint.nodes) {
    if (node.declarations.some((declaration) => declaration.gates.length > 0))
      conditional.add(node);
    const children = node.childEntries.map((entry) => entry.node);
    for (const entry of node.childEntries)
      if (
        entry.declarations.some((declaration) => declaration.gates.length > 0)
      )
        conditional.add(entry.node);
    if (node.item) children.push(node.item);
    if (node.itemCandidates) children.push(...node.itemCandidates);
    if (node.prefixItems) children.push(...node.prefixItems);
    if (node.prefixItemCandidates)
      for (const candidates of node.prefixItemCandidates)
        children.push(...candidates);
    for (const child of children) {
      const incoming = parents.get(child);
      if (incoming) incoming.push(node);
      else parents.set(child, [node]);
    }
  }
  const pending = [...conditional];
  for (let index = 0; index < pending.length; index++)
    for (const parent of parents.get(pending[index]) ?? [])
      if (!conditional.has(parent)) {
        conditional.add(parent);
        pending.push(parent);
      }
  return conditional;
};
