import type { Nullable, Optional } from '@aileron/declare';

import { visitFieldNodes } from '../../../navigation';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getGateRegistry } from '../gates/getGateRegistry';
import { updatePendingExitIndex } from '../scratch/updatePendingExitIndex';
import { pruneArraySlotTail } from '../slots/pruneArraySlotTail';
import { pruneArrayTailPaths } from './pruneArrayTailPaths';
import { prunePerishedPaths } from './prunePerishedPaths';
import { detachPerishedNode } from './utils/detachPerishedNode';

/** Visit only the subtree owned by each perished item. */
const OWNED = { isOwned: true } as const;

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
  let perishedPaths: Optional<Set<string>>;
  const registry = getGateRegistry(context.root.runtime);
  const pendingExits = context.pendingExits;
  const perishing = pendingExits.size ? new Set<Self>() : undefined;
  let rekeyed: Optional<{ previous: string; current?: string }>;
  const detach = (departing: Self): void =>
    detachPerishedNode(departing, context, rekeyed);
  for (const node of context.perishedNodes) {
    if (node.__parent__?.__childrenByName__?.[node.name] === node) continue;
    rekeyed = node.__parent__
      ? context.rekeyedArrayMoves?.get(node.__parent__)?.[Number(node.name)]
      : undefined;
    visitFieldNodes(node, detach, OWNED);
    registry.remove(node);
    perishing?.add(node);
    const parent = node.__parent__;
    const destinationCount =
      parent && context.rekeyedArrayMoves?.has(parent)
        ? parent.__itemCount__
        : undefined;
    if (
      !parent?.__childrenByName__?.[node.name] &&
      (destinationCount === undefined || Number(node.name) >= destinationCount)
    )
      (perishedPaths ??= new Set()).add(node.path);
  }
  if (perishing?.size)
    for (const [key, pending] of pendingExits) {
      const ancestor = findPerishedAncestor(pending, perishing);
      if (ancestor) {
        rekeyed = ancestor.__parent__
          ? context.rekeyedArrayMoves?.get(ancestor.__parent__)?.[
              Number(ancestor.name)
            ]
          : undefined;
        pendingExits.delete(key);
        const path: string = JSON.parse(key)[0];
        updatePendingExitIndex(context, path, -1);
        // Already out of its item's children, so the owned walk above missed it.
        visitFieldNodes(pending, detach, OWNED);
        registry.remove(pending);
      }
    }
  if (perishedPaths) {
    prunePerishedPaths(context.root.runtime, perishedPaths);
  }
  const resizedHosts = new Map<string, number>();
  for (const [host, previousCount] of context.arrayCounts)
    if (!host.isDetached && host.__itemCount__ !== previousCount) {
      pruneArraySlotTail(host, context);
      resizedHosts.set(host.path, host.__itemCount__);
    }
  if (resizedHosts.size) {
    pruneArrayTailPaths(context.root.runtime, resizedHosts);
  }
};

/**
 * Find the perished item owning a pending exit through its unchanged parent chain.
 * @param node - Pending exit whose path can collide with a surviving moved item
 * @param perishing - Items disposed by this finalization pass
 * @returns Owning perished occurrence, or undefined when the exit remains independent
 */
const findPerishedAncestor = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  perishing: ReadonlySet<Self>,
): Optional<Self> => {
  for (
    let current: Nullable<Self> = node;
    current;
    current = current.__parent__
  )
    if (perishing.has(current)) return current;
  return undefined;
};
