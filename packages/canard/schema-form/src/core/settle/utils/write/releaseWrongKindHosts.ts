import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { computeNode } from '../compute/computeNode';
import { isPlain } from './isPlain';
import { registerRecalculation } from './registerRecalculation';

/**
 * Clear a caller-touched wrong-kind host only after a child emits.
 * @param context - Settlement with candidate hosts and calculated children
 * @returns Nothing; cleared hosts are recomputed before the explicit source snapshot
 */
export const releaseWrongKindHosts = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  let cleared: boolean;
  do {
    cleared = false;
    const hosts = [...context.wrongKindHosts].sort(
      (left, right) => right.depth - left.depth);
    for (const host of hosts) {
      if (host.detached || host.raw === undefined || isPlain(host.raw)) continue;
      if (!(host.children ?? []).some((child) => child.emit !== undefined)) continue;
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
