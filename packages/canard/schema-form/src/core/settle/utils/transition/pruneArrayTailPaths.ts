import { isArray } from '@winglet/common-utils/filter';
import type { SchemaNodeRuntime } from '../../../record';
import { getRuntimePathStores } from '../pathIndex/getRuntimePathStores';
import { prunePerishedPaths } from './prunePerishedPaths';

/**
 * Find absent numeric slots through each store's decimal range index.
 * @param runtime - Tree whose managed stores may retain absent positions
 * @param hosts - Final item counts keyed by live array host path
 * @returns Nothing; only removed slot roots reach the subtree pruner
 */
export const pruneArrayTailPaths = <Self>(
  runtime: SchemaNodeRuntime<Self>, hosts: ReadonlyMap<string, number>,
): void => {
  if (hosts.size === 0) return;
  const stores = getRuntimePathStores(runtime);
  const removed = new Set<string>();
  for (const [host, count] of hosts) {
    for (const store of [stores.latent, stores.metadata, stores.declarations,
      stores.mismatches, stores.rules])
      for (const path of store.pathIndex.tail(host, count)) removed.add(path);
    for (const key of runtime.warningKeysByPath?.get(host) ?? []) {
      const parts: unknown = JSON.parse(key);
      if (!isArray(parts) || typeof parts[1] !== 'string') continue;
      const prefix = `${host}/`;
      const segment = parts[1].slice(prefix.length).split('/')[0];
      const index = Number(segment);
      if (parts[1].startsWith(prefix) && Number.isInteger(index) &&
        index >= count && index >= 0 && String(index) === segment)
        removed.add(prefix + segment);
    }
  }
  prunePerishedPaths(runtime, removed);
};
