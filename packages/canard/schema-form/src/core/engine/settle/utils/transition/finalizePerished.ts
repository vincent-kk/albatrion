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
 * Whether an occurrence perished with one of the given nodes, read through its parent chain.
 * @param node - Pending exit occurrence; a moved item's path may equal a perished one's
 * @param perishing - Perished nodes detached in this pass
 * @returns True when the occurrence is one of them or below one of them
 */
const isPerishedWith = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  perishing: ReadonlySet<Self>,
): boolean => {
  for (let current: Self | null = node; current; current = current.parent)
    if (perishing.has(current)) return true;
  return false;
};

/**
 * Detach final length-removed items without exit clearing or latent capture.
 * The tree's gate registry and the visitor are obtained once; when pending exits exist,
 * those that perished with an item, matched once by node identity, leave the exits and
 * are detached with it like its other descendants (NODE-044).
 * @param context - Settlement whose array selection marked perished items
 * @returns Nothing; old references retain their last committed reads
 */
export const finalizePerished = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  let perishedPaths: Set<string> | undefined;
  const registry = getGateRegistry(context.root.runtime);
  const pendingExits = context.pendingExits;
  const perishing = pendingExits.size ? new Set<Self>() : undefined;
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
    perishing?.add(node);
    if (!node.parent?.structure?.[node.name])
      (perishedPaths ??= new Set()).add(node.path);
  }
  if (perishing?.size)
    for (const [key, pending] of pendingExits)
      if (isPerishedWith(pending, perishing)) {
        pendingExits.delete(key);
        // Already out of its item's children, so the owned walk above missed it.
        visitFieldNodes(pending, detach, OWNED);
        registry.remove(pending);
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
