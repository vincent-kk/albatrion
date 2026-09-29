import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';

/** Reopen an object host suppressed by an earlier wrong-kind whole value. */
export const promoteHostForChildWrite = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): void => {
  let parent = node.parent;
  while (parent) {
    if (parent.behavior.type === 'object' && parent.behavior.strategy === 'branch' &&
      parent.raw !== undefined && (parent.raw === null ||
        typeof parent.raw !== 'object' || Array.isArray(parent.raw))) {
      parent.raw = {};
      context.changedRaw.add(parent.path);
      context.changedNodes.add(parent);
      context.dirtyPaths.add(parent.path);
      context.shapeDirtyPaths.add(parent.path);
    }
    parent = parent.parent;
  }
};
