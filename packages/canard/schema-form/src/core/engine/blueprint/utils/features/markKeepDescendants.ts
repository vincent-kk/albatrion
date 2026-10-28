import type { MutableNode } from '../../types/analysis';
import { collectTemplateParents } from './collectTemplateParents';
import { readKeepDeclarations } from './readKeepDeclarations';

/**
 * Mark every template that has a possible explicit keep strictly below it.
 * @param nodes - Construction-owned templates before development freezing
 * @returns Nothing; graphs without a keep declaration allocate no reverse graph
 */
export const markKeepDescendants = (nodes: readonly MutableNode[]): void => {
  let pending: MutableNode[] | undefined;
  for (const node of nodes) {
    const { own, child } = readKeepDeclarations(node.declarations);
    if (child) node.hasKeepDescendants = true;
    if (own || child) (pending ??= []).push(node);
  }
  if (!pending) return;
  const parents = collectTemplateParents(nodes);
  for (let index = 0; index < pending.length; index++)
    for (const parent of parents.get(pending[index]) ?? [])
      if (!parent.hasKeepDescendants) {
        parent.hasKeepDescendants = true;
        pending.push(parent);
      }
};
