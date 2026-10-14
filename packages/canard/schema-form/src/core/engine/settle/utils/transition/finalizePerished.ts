import { captureFieldNodeChange } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { captureDetachedFieldNodeReads } from '../detached/captureDetachedFieldNodeReads';
import { getGateRegistry } from '../gates/getGateRegistry';
import { walkOwnedFieldNodes } from '../walkOwnedFieldNodes';
import { pruneArrayTailPaths } from './pruneArrayTailPaths';
import { prunePerishedPaths } from './prunePerishedPaths';

/**
 * Detach final length-removed items without exit clearing or latent capture.
 * @param context - Settlement whose array selection marked perished items
 * @returns Nothing; old references retain their last committed reads
 */
export const finalizePerished = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  let perishedPaths: Set<string> | undefined;
  for (const node of context.perished) {
    if (node.parent?.structure?.[node.name] === node) continue;
    walkOwnedFieldNodes(node, (departing) => {
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
    });
    getGateRegistry(node.runtime).remove(node);
    for (const [key, pending] of context.pendingExits)
      if (
        pending.path === node.path ||
        pending.path.startsWith(`${node.path}/`)
      )
        context.pendingExits.delete(key);
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
