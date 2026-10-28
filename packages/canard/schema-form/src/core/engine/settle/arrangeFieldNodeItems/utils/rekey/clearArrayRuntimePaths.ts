import { appendSegment, readPointerSegment } from '@/schema-form/helpers/jsonPointer';
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
 * the owned stores lose all entries beneath any numeric slot,
 * warnings under old and out-of-range slots are dropped, and the memo stores lose old slots and the host's ancestor entries.
 * @param runtime - Tree-owned stores and their persistent path indexes
 * @param hostPath - Array host whose every position perished
 * @param oldCount - Item count before the edit; positions at or beyond it are out of range
 * @param _perished - Paths of the live items that perished, each `hostPath/<position>`
 * @returns Nothing; affected stores and memo entries are removed
 */
export const clearArrayRuntimePaths = <Self>(
  runtime: FieldNodeRuntime<Self>,
  hostPath: string,
  oldCount: number,
  _perished: ReadonlySet<string>,
): void => {
  const stores = getRuntimePathStores(runtime);
  const inRange = (slot: string) =>
    Number(readPointerSegment(slot, -1)) < oldCount;
  const owned = [stores.declarations, stores.rules, stores.misfits];
  const slots = new Set<string>();
  for (const store of owned) {
    if (!store) continue;
    for (const slot of store.pathIndex.tail(hostPath, 0)) slots.add(slot);
  }
  if (runtime.warningKeysByPath?.get(hostPath)?.size) {
    const warningKeys = new Set<string>();
    for (let index = 0; index < oldCount; index++)
      for (const key of runtime.warningKeysByPath.get(appendSegment(hostPath, index)) ?? [])
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
  for (const slot of slots) {
    for (const store of [stores.misfits, stores.declarations]) {
      if (!store) continue;
      for (const key of store.pathIndex.under(slot)) store.delete(key);
    }
    for (const key of stores.rules.pathIndex.under(slot))
      updateCommittedRuleValue(runtime, key, 'delete');
  }
  if (oldCount === 0) return;
  for (const store of [stores.misfitsMemo]) {
    if (!store) continue;

    const keys = keysBeneath(store.pathIndex, hostPath, inRange);
    for (const key of store.pathIndex.intersecting(appendSegment(hostPath, 0))) keys.add(key);
    for (const key of keys) store.delete(key);
  }
};
