import type { SchemaNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../type';
import { dirtyChildren } from '../dirtyChildren';
import { selectNodeSchema } from '../selectNodeSchema';
import { updateOutput } from '../updateOutput';

/**
 * Consume a dirty frontier whose gates, appearances, and shape work are absent.
 * @param node - Live record reached under the caller's branchless stable proof
 * @param context - Call with empty entered and shapeDirtyPaths containers
 * @returns Nothing; updates records in child post-order and consumes dirty paths
 */
export const computeStableNode = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): void => {
  if (!context.dirtyPaths.has(node.path)) return;
  context.stateDirtyNodes.add(node);
  if (node.behavior.strategy === 'branch') {
    const recalculated = dirtyChildren(node, context);
    for (let index = 0; index < recalculated.length; index++)
      computeStableNode(recalculated[index], context);
    updateOutput(node, context, recalculated);
  } else {
    if (node.parent === null) selectNodeSchema(node, context);
    updateOutput(node, context);
  }
  context.dirtyPaths.delete(node.path);
};
