import { isArray } from '@winglet/common-utils/filter';

import type { FieldNodeRuntime } from '../../../../record';
import { indexFieldNodeWarning } from '../../../../record';
import type { PathKeyedSet } from '../../../../utils/pathIndex/PathKeyedSet';
import { updateCommittedRuleValue } from '../../../utils/commit/updateCommittedRuleValue';
import { getRuntimePathStores } from '../../../utils/pathStores/getRuntimePathStores';

/**
 * Collect the keys beneath a host's indexed positions that satisfy a slot filter.
 * @param index - Path index of one store
 * @param hostPath - Array host whose canonical numeric slots are listed
 * @param keep - Whether the keys beneath one slot path are collected
 * @returns Distinct keys, copied so the caller may delete while iterating
 */
const keysBeneath = (
  index: PathKeyedSet['pathIndex'],
  hostPath: string,
  keep: (slot: string) => boolean,
): Set<string> => {
  const keys = new Set<string>();
  for (const slot of [...index.tail(hostPath, 0)])
    if (keep(slot)) for (const key of index.under(slot)) keys.add(key);
  return keys;
};

/**
 * Remove every path-store entry beneath an emptied host in one pass over its indexed positions.
 * The result equals pruning the perished item paths and then re-keying every old position as perished:
 * the five owned stores lose all entries beneath any numeric slot, the inactive memo loses the perished and out-of-range slots,
 * warnings under old and out-of-range slots are dropped, and the memo stores lose old slots and the host's ancestor entries.
 * @param runtime - Tree-owned stores and their persistent path indexes
 * @param hostPath - Array host whose every position perished
 * @param oldCount - Item count before the edit; positions at or beyond it are out of range
 * @param perished - Paths of the live items that perished, each `hostPath/<position>`
 * @returns Nothing; `latentRawDirty` is set exactly when the per-position cleanup would set it
 */
export const clearArrayRuntimePaths = <Self>(
  runtime: FieldNodeRuntime<Self>,
  hostPath: string,
  oldCount: number,
  perished: ReadonlySet<string>,
): void => {
  runtime.inactiveValuesRebuild = true;
  const stores = getRuntimePathStores(runtime);
  const prefix = hostPath + '/';
  const inRange = (slot: string) =>
    Number(slot.slice(prefix.length)) < oldCount;
  const owned = [
    stores.latent,
    stores.metadata,
    stores.declarations,
    stores.rules,
    stores.misfits,
  ];
  const slots = new Set<string>();
  for (const store of owned)
    for (const slot of store.pathIndex.tail(hostPath, 0)) slots.add(slot);
  if (runtime.warningKeysByPath?.get(hostPath)?.size) {
    const warningKeys = new Set<string>();
    for (let index = 0; index < oldCount; index++)
      for (const key of runtime.warningKeysByPath.get(prefix + index) ?? [])
        warningKeys.add(key);
    for (const slot of slots)
      if (!inRange(slot))
        for (const key of runtime.warningKeysByPath.get(slot) ?? [])
          warningKeys.add(key);
    for (const key of warningKeys) {
      const parts: unknown = JSON.parse(key);
      if (isArray(parts) && typeof parts[1] === 'string')
        indexFieldNodeWarning(runtime, key, parts[1], undefined, true);
    }
  }
  let latentChanged = false;
  for (const slot of slots)
    if (
      !perished.has(slot) &&
      inRange(slot) &&
      (stores.latent.pathIndex.under(slot).size > 0 ||
        stores.metadata.pathIndex.under(slot).size > 0)
    )
      latentChanged = true;
  const inactive = keysBeneath(
    stores.inactiveMemo.pathIndex,
    hostPath,
    (slot) => perished.has(slot) || (!inRange(slot) && slots.has(slot)),
  );
  for (const slot of slots) {
    for (const key of stores.latent.pathIndex.under(slot)) {
      stores.latent.delete(key);
      runtime.latentRawDirty = true;
    }
    for (const store of [stores.metadata, stores.misfits, stores.declarations])
      for (const key of store.pathIndex.under(slot)) store.delete(key);
    for (const key of stores.rules.pathIndex.under(slot))
      updateCommittedRuleValue(runtime, key, 'delete');
  }
  for (const key of inactive) stores.inactiveMemo.delete(key);
  if (latentChanged) runtime.latentRawDirty = true;
  if (oldCount === 0) return;
  for (const store of [
    stores.misfitsMemo,
    stores.inactiveMemo,
    stores.inactiveEntries,
  ]) {
    if (store !== stores.misfitsMemo && !runtime.latentRawDirty) continue;
    const keys = keysBeneath(store.pathIndex, hostPath, inRange);
    for (const key of store.pathIndex.intersecting(prefix + '0')) keys.add(key);
    for (const key of keys) store.delete(key);
  }
};
