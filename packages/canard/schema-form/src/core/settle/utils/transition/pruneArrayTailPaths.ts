import { isArray } from '@winglet/common-utils/filter';
import type { SchemaNodeRuntime } from '../../../record';
import { prunePerishedPaths } from './prunePerishedPaths';

/**
 * Discard absent slots for all resized array hosts in one store scan.
 * @param runtime - Tree whose path-keyed stores may contain removed slots
 * @param hosts - Final item counts keyed by live array host path
 * @returns Nothing; surviving slot paths remain untouched
 */
export const pruneArrayTailPaths = <Self>(
  runtime: SchemaNodeRuntime<Self>, hosts: ReadonlyMap<string, number>,
): void => {
  const removed = new Set<string>();
  const check = (path: string): void => {
    for (let boundary = path.indexOf('/'); boundary !== -1;
      boundary = path.indexOf('/', boundary + 1)) {
      const prefix = path.slice(0, boundary);
      const count = hosts.get(prefix);
      if (count === undefined) continue;
      const next = path.indexOf('/', boundary + 1);
      const segment = path.slice(boundary + 1, next === -1 ? undefined : next);
      const index = Number(segment);
      if (Number.isInteger(index) && index >= count && index >= 0 &&
        String(index) === segment) removed.add(`${prefix}/${segment}`);
    }
  };
  for (const key of runtime.latentRaw.keys()) {
    const identity: unknown = JSON.parse(key);
    if (isArray(identity) && typeof identity[0] === 'string') check(identity[0]);
  }
  for (const metadata of runtime.latentRawMetadata?.values() ?? []) check(metadata.path);
  for (const key of runtime.committedDeclarationIds?.keys() ?? []) {
    const identity: unknown = JSON.parse(key);
    if (isArray(identity) && typeof identity[0] === 'string') check(identity[0]);
  }
  for (const path of runtime.typeMismatchPaths) check(path);
  for (const path of runtime.committedRuleKeysBySource?.keys() ?? []) check(path);
  for (const path of runtime.committedRuleKeysByTarget?.keys() ?? []) check(path);
  for (const path of hosts.keys())
    for (const key of runtime.warningKeysByPath?.get(path) ?? []) {
      const parts: unknown = JSON.parse(key);
      if (isArray(parts) && typeof parts[1] === 'string') check(parts[1]);
    }
  prunePerishedPaths(runtime, removed);
};
