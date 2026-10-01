import { isArray } from '@winglet/common-utils/filter';
import type { SchemaNodeRuntime } from '../../../record';
import { pruneCommittedRuleKeys } from '../commit/pruneCommittedRuleKeys';

/**
 * Drop path-keyed sources and baselines for all perished array items in one pass.
 * @param runtime - Tree whose path-keyed stores own the removed slots
 * @param paths - Removed item paths at the roots of their scopes
 * @returns Nothing; unrelated paths retain their entries
 */
export const prunePerishedPaths = <Self>(
  runtime: SchemaNodeRuntime<Self>, paths: ReadonlySet<string>,
): void => {
  if (paths.size === 0) return;
  const under = (candidate: string): boolean => {
    let end = candidate.length;
    while (end > 0) {
      if (paths.has(candidate.slice(0, end))) return true;
      end = candidate.lastIndexOf('/', end - 1);
    }
    return paths.has('');
  };
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
  const matchedRulePaths = new Set<string>();
  for (const path of runtime.committedRuleKeysBySource?.keys() ?? [])
    if (under(path)) matchedRulePaths.add(path);
  for (const path of runtime.committedRuleKeysByTarget?.keys() ?? [])
    if (under(path)) matchedRulePaths.add(path);
  for (const path of matchedRulePaths)
    pruneCommittedRuleKeys(runtime, path, 'occurrence');
};
