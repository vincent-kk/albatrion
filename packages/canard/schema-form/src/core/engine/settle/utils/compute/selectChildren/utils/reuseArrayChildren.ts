import { getItemEntry } from '../../../../../blueprint';
import type { FieldNodeRecord } from '../../../../../record';
import type { SettlementContext } from '../../../../type';
import { staticIds } from './staticIds';

/**
 * Publish the static selection of an array host already proven reusable.
 * The caller has established eligibility with `canReuseArrayChildren`.
 * @param node - Array host whose structural operation already published its slots
 * @param context - Selection registry updated and dirty frontier consulted
 * @param prior - Structure captured before the host's selection round
 * @param computeChild - Existing descent for children still on the dirty frontier
 * @returns Nothing; the selection registry carries the published IDs and dirty children are computed through computeChild
 */
export const reuseArrayChildren = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  prior: Record<string, Self>,
  computeChild: (child: Self) => void,
): void => {
  for (let index = 0; index < node.itemCount; index++) {
    const entry = getItemEntry(node.blueprintNode, index);
    if (!entry) continue;
    const child = prior[entry.name];
    const ids = staticIds(entry);
    if (context.selectedDeclarationIds.get(child) !== ids)
      context.selectedDeclarationIds.set(child, ids);
    if (context.dirtyPaths.has(child.path)) computeChild(child);
  }
};
