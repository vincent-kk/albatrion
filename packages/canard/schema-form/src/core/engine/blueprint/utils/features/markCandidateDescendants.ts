import type { MutableNode } from '../../types/analysis';
import { collectTemplateParents } from './collectTemplateParents';

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
  const parents = collectTemplateParents(nodes);
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
