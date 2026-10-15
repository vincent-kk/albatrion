import { visitFieldNodes } from '../../../navigation';
import { captureFieldNodeChange } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { captureDetachedFieldNodeReads } from '../detached/captureDetachedFieldNodeReads';
import { getGateRegistry } from '../gates/getGateRegistry';
import { pruneArrayTailPaths } from './pruneArrayTailPaths';
import { prunePerishedPaths } from './prunePerishedPaths';

/** Visit only the subtree owned by each perished item. */
const OWNED = { owned: true } as const;

/**
 * Detach final length-removed items without exit clearing or latent capture.
 * The tree's gate registry and the visitor are obtained once; pending exits are scanned per node only when any exist.
 * @param context - Settlement whose array selection marked perished items
 * @returns Nothing; old references retain their last committed reads
 */
export const finalizePerished = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  let perishedPaths: Set<string> | undefined;
  const registry = getGateRegistry(context.root.runtime);
  const pendingExits = context.pendingExits;
  const detach = (departing: Self): void => {
    if (!departing.runtime.detachedReads?.has(departing))
      captureDetachedFieldNodeReads(departing, {
        emit: context.previousEmit,
        context: context.previousContext,
        schema:
          context.originalSchemas.get(departing.path)?.schema ??
          departing.schema.schema,
      });
    departing.detached = true;
    departing.active = captureFieldNodeChange(departing, 'active', false);
  };
  for (const node of context.perished) {
    if (node.parent?.structure?.[node.name] === node) continue;
    visitFieldNodes(node, detach, OWNED);
    registry.remove(node);
    if (pendingExits.size)
      for (const [key, pending] of pendingExits)
        if (
          pending.path === node.path ||
          pending.path.startsWith(node.path + '/')
        )
          pendingExits.delete(key);
    if (!node.parent?.structure?.[node.name])
      (perishedPaths ??= new Set()).add(node.path);
  }
  if (perishedPaths) {
    prunePerishedPaths(context.root.runtime, perishedPaths);
    context.latentDescendantKeys = undefined;
  }
  const resizedHosts = new Map<string, number>();
  for (const [host, previousCount] of context.arrayCounts)
    if (!host.detached && host.itemCount !== previousCount)
      resizedHosts.set(host.path, host.itemCount);
  if (resizedHosts.size) {
    pruneArrayTailPaths(context.root.runtime, resizedHosts);
    context.latentDescendantKeys = undefined;
  }
};
