import { isArray } from '@winglet/common-utils/filter';
import type { SchemaNodeRuntime } from '../../../record';
import { indexSchemaNodeWarning } from '../../../record';
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
  const warningKeys = new Set<string>();
  for (const path of paths)
    for (const key of runtime.warningKeysByPath?.get(path) ?? []) warningKeys.add(key);
  for (const key of warningKeys) {
    const parts: unknown = JSON.parse(key);
    if (isArray(parts) && typeof parts[1] === 'string')
      indexSchemaNodeWarning(runtime, key, parts[1], undefined, true);
  }
  const lengths = new Set<number>();
  for (const path of paths) lengths.add(path.length);
  const pruneRoot = paths.has('');
  const under = (candidate: string): boolean => {
    if (pruneRoot) return true;
    for (const length of lengths)
      if ((candidate.length === length || candidate.charCodeAt(length) === 47) &&
        paths.has(candidate.slice(0, length))) return true;
    return false;
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
