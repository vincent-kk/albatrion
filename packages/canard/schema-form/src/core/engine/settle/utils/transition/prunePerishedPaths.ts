import { isArray } from '@winglet/common-utils/filter';

import type { FieldNodeRuntime } from '../../../record';
import { indexFieldNodeWarning } from '../../../record';
import { updateCommittedRuleValue } from '../commit/updateCommittedRuleValue';
import { getRuntimePathStores } from '../pathStores/getRuntimePathStores';

/**
 * Drop only entries indexed beneath perished item roots.
 * @param runtime - Tree-owned stores and their persistent path indexes
 * @param paths - Removed item roots, including latent descendants
 * @returns Nothing; unrelated entries and baselines retain their identity
 */
export const prunePerishedPaths = <Self>(
  runtime: FieldNodeRuntime<Self>,
  paths: ReadonlySet<string>,
): void => {
  if (paths.size === 0) return;
  const stores = getRuntimePathStores(runtime);
  const warningKeys = new Set<string>();
  if (runtime.warningKeysByPath?.size)
    for (const path of paths)
      for (const key of runtime.warningKeysByPath.get(path) ?? [])
        warningKeys.add(key);
  for (const key of warningKeys) {
    const parts: unknown = JSON.parse(key);
    if (isArray(parts) && typeof parts[1] === 'string')
      indexFieldNodeWarning(runtime, key, parts[1], undefined, true);
  }
  for (const store of [stores.misfits, stores.declarations]) {
    if (!store) continue;
    if (store.size)
      for (const path of paths)
        for (const key of store.pathIndex.under(path)) store.delete(key);
  }
  if (stores.rules.size)
    for (const path of paths)
      for (const key of stores.rules.pathIndex.under(path))
        updateCommittedRuleValue(runtime, key, 'delete');
};
