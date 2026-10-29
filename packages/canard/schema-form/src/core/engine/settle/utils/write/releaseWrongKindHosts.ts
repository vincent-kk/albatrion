import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { computeNode } from '../compute/computeNode';
import { registerRecalculation } from '../dependencies/registerRecalculation';
import { isPlain } from '../input/isPlain';

/**
 * Clear a caller-touched wrong-kind host only after a child emits.
 * @param context - Settlement with candidate hosts and calculated children
 * @returns Nothing; cleared hosts are recomputed before the explicit source snapshot
 */
export const releaseWrongKindHosts = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  let cleared: boolean;
  do {
    cleared = false;
    const hosts = [...context.wrongKindHosts].sort(
      (left, right) => right.depth - left.depth,
    );
    for (const host of hosts) {
      if (host.detached || host.raw === undefined || isPlain(host.raw))
        continue;
      let hasEmittedChild = false;

      const hostChildren = host.children ?? [];
      for (let index = 0, count = hostChildren.length; index < count; index++) {
        const child = hostChildren[index];

        if (child.emit !== undefined) {
          hasEmittedChild = true;
          break;
        }
      }

      if (!hasEmittedChild) {
        continue;
      }
      host.raw = undefined;
      context.changedRaw.add(host.path);
      context.changedNodes.add(host);
      context.dirtyPaths.add(host.path);
      context.shapeDirtyPaths.add(host.path);
      cleared = true;
    }
    if (cleared) {
      registerRecalculation(context);
      computeNode(context.root, context);
    }
  } while (cleared);
};
