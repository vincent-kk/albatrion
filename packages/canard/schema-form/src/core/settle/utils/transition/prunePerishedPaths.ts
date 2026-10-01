import { isArray } from '@winglet/common-utils/filter';
import type { SchemaNodeRuntime } from '../../../record';
import { indexSchemaNodeWarning } from '../../../record';
import { updateCommittedRuleValue } from '../commit/updateCommittedRuleValue';
import { getRuntimePathStores } from '../pathIndex/getRuntimePathStores';

/**
 * Drop only entries indexed beneath perished item roots.
 * @param runtime - Tree-owned stores and their persistent path indexes
 * @param paths - Removed item roots, including latent descendants
 * @returns Nothing; unrelated entries and baselines retain their identity
 */
export const prunePerishedPaths = <Self>(
  runtime: SchemaNodeRuntime<Self>, paths: ReadonlySet<string>,
): void => {
  if (paths.size === 0) return;
  const stores = getRuntimePathStores(runtime);
  const warningKeys = new Set<string>();
  for (const path of paths)
    for (const key of runtime.warningKeysByPath?.get(path) ?? []) warningKeys.add(key);
  for (const key of warningKeys) {
    const parts: unknown = JSON.parse(key);
    if (isArray(parts) && typeof parts[1] === 'string')
      indexSchemaNodeWarning(runtime, key, parts[1], undefined, true);
  }
  for (const path of paths) {
    for (const key of stores.latent.pathIndex.under(path)) {
      stores.latent.delete(key);
      runtime.latentRawDirty = true;
    }
    for (const store of [stores.metadata, stores.mismatches,
      stores.inactiveMemo, stores.declarations])
      for (const key of store.pathIndex.under(path)) store.delete(key);
    for (const key of stores.rules.pathIndex.under(path))
      updateCommittedRuleValue(runtime, key, 'delete');
  }
};
