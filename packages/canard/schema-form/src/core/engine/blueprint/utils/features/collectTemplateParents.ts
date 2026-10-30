import type { MutableNode } from '../../types/analysis';
import type { BlueprintNode } from '../../types/node';

/**
 * Build the construction-only reverse graph of a completed finite template graph.
 * @param nodes - Construction-owned templates before development freezing
 * @returns Hosts that bind each template through a named, item or tuple edge
 */
export const collectTemplateParents = (
  nodes: readonly MutableNode[],
): Map<BlueprintNode, MutableNode[]> => {
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
  return parents;
};

/**
 * Register one reverse template edge without retaining construction data afterward.
 * @param parents - Invocation-local reverse edges
 * @param child - Template reached through a host binding
 * @param parent - Construction-owned host of that binding
 * @returns Nothing; recursive edges terminate through the callers' marked work lists
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
