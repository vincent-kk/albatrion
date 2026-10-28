import type { MutableNode } from '../../types/analysis';
import type { BlueprintNode } from '../../types/node';

/**
 * Mark candidate reachability on the completed finite graph.
 * @param nodes - Construction-owned templates before development freezing
 * @returns Nothing; single-candidate graphs allocate no reverse graph or work list
 */
export const markCandidateDescendants = (
  nodes: readonly MutableNode[],
): void => {
  let pending: MutableNode[] | undefined;
  for (const node of nodes)
    if (
      node.hasPropertyCandidates ||
      node.itemCandidates ||
      node.prefixItemCandidates
    ) {
      node.hasCandidateDescendants = true;
      (pending ??= []).push(node);
    }
  if (!pending) return;
  const parents = new Map<BlueprintNode, MutableNode[]>();
  for (const node of nodes) {
    for (const entry of node.childEntries)
      appendParent(parents, entry.node, node);
    for (const child of node.itemCandidates ?? (node.item ? [node.item] : []))
      appendParent(parents, child, node);
    const prefixItems = node.prefixItems;
    if (prefixItems)
      for (let index = 0; index < prefixItems.length; index++)
        for (const child of node.prefixItemCandidates?.[index] ?? [
          prefixItems[index],
        ])
          appendParent(parents, child, node);
  }
  for (let index = 0; index < pending.length; index++)
    for (const parent of parents.get(pending[index]) ?? []) {
      let changed = false;
      if (
        pending[index].hasCandidateDescendants &&
        !parent.hasCandidateDescendants
      ) {
        parent.hasCandidateDescendants = true;
        changed = true;
      }
      if (changed) pending.push(parent);
    }
};

/**
 * Register one reverse template edge without retaining construction data afterward.
 * @param parents - Invocation-local reverse edges
 * @param child - Template reached through a host binding
 * @param parent - Construction-owned host of that binding
 * @returns Nothing; recursive edges terminate through the marked work list
 */
const appendParent = (
  parents: Map<BlueprintNode, MutableNode[]>,
  child: BlueprintNode,
  parent: MutableNode,
): void => {
  const previous = parents.get(child);
  if (previous) previous.push(parent);
  else parents.set(child, [parent]);
};
