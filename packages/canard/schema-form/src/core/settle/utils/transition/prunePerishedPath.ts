import { isArray } from '@winglet/common-utils/filter';
import type { SchemaNodeRuntime } from '../../../record';
import { pruneCommittedRuleKeys } from '../commit/pruneCommittedRuleKeys';

/**
 * Drop every path-keyed source and baseline owned by a perished array item.
 * @param runtime - Tree whose path-keyed stores own the removed slot
 * @param path - Removed item path at the root of the scope
 * @returns Nothing; unrelated paths retain their entries
 */
export const prunePerishedPath = <Self>(
  runtime: SchemaNodeRuntime<Self>, path: string,
): void => {
  const under = (candidate: string): boolean => candidate === path ||
    candidate.startsWith(`${path}/`);
  for (const key of runtime.latentRaw.keys()) {
    const identity: unknown = JSON.parse(key);
    if (isArray(identity) && typeof identity[0] === 'string' && under(identity[0])) {
      runtime.latentRaw.delete(key);
      runtime.latentRawDirty = true;
    }
  }
  for (const [key, metadata] of runtime.latentRawMetadata ?? [])
    if (under(metadata.path)) runtime.latentRawMetadata?.delete(key);
  for (const path of runtime.typeMismatchPaths)
    if (under(path)) runtime.typeMismatchPaths.delete(path);
  for (const path of runtime.inactiveValuesMemo.keys())
    if (under(path)) runtime.inactiveValuesMemo.delete(path);
  for (const key of runtime.committedDeclarationIds?.keys() ?? []) {
    const identity: unknown = JSON.parse(key);
    if (isArray(identity) && typeof identity[0] === 'string' && under(identity[0]))
      runtime.committedDeclarationIds?.delete(key);
  }
  for (const path of [...runtime.committedRuleKeysBySource?.keys() ?? [],
    ...runtime.committedRuleKeysByTarget?.keys() ?? []])
    if (under(path)) pruneCommittedRuleKeys(runtime, path, 'occurrence');
};
