import { isArray } from '@winglet/common-utils/filter';

import {
  appendSegment,
  getChildPointer,
  isDescendantPath,
  readPointerSegment,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRuntime } from '../../../record';
import { getRuntimePathStores } from '../pathStores/getRuntimePathStores';
import { prunePerishedPaths } from './prunePerishedPaths';

/**
 * Find absent numeric slots through each store's decimal range index.
 * @param runtime - Tree whose managed stores may retain absent positions
 * @param hosts - Final item counts keyed by live array host path
 * @returns Nothing; only removed slot roots reach the subtree pruner
 */
export const pruneArrayTailPaths = <Self>(
  runtime: FieldNodeRuntime<Self>,
  hosts: ReadonlyMap<string, number>,
): void => {
  if (hosts.size === 0) return;
  const stores = getRuntimePathStores(runtime);
  const removed = new Set<string>();
  for (const [host, count] of hosts) {
    for (const store of [stores.declarations, stores.misfits, stores.rules]) {
      if (!store) continue;
      for (const path of store.pathIndex.tail(host, count)) removed.add(path);
    }
    for (const key of runtime.warningKeysByPath?.get(host) ?? []) {
      const parts: unknown = JSON.parse(key);
      if (!isArray(parts) || typeof parts[1] !== 'string') continue;
      const child = getChildPointer(parts[1], host);
      const segment =
        child === undefined ? undefined : readPointerSegment(child, -1);
      if (typeof segment !== 'string') continue;
      const index = Number(segment);
      if (
        isDescendantPath(parts[1], host) &&
        Number.isInteger(index) &&
        index >= count &&
        index >= 0 &&
        String(index) === segment
      )
        removed.add(appendSegment(host, segment));
    }
  }
  prunePerishedPaths(runtime, removed);
};
