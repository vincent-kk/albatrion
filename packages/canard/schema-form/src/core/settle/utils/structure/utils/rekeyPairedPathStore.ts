import { isArray } from '@winglet/common-utils/filter';
import type { PathKeyedMap } from '../../../../utils/pathIndex/PathKeyedMap';
import type { PathKeyedMove } from '../../../../utils/pathIndex/type';
import type { ArrayPathMove } from '../type';

/**
 * Move only affected pair-keyed entries, retaining shared prefix/radix metadata.
 * @param store - Explicit path-keyed runtime store
 * @param moves - Changed or perished positions
 * @param mapPath - Translate one occurrence to its surviving destination
 * @param transform - Optional metadata adjustment for the destination
 * @returns Nothing; all old identities are removed before any destination is inserted
 */
export const rekeyPairedPathStore = <Value>(
  store: PathKeyedMap<Value>, moves: readonly ArrayPathMove[],
  mapPath: (path: string) => string | undefined,
  transform?: (value: Value, path: string, previous: string) => Value,
): void => {
  const keys = new Set<string>();
  for (const move of moves)
    for (const key of store.pathIndex.under(move.previous)) keys.add(key);
  const replacements: PathKeyedMove<Value>[] = [];
  for (const key of keys) {
    const parts: unknown = JSON.parse(key);
    if (!isArray(parts) || typeof parts[0] !== 'string') continue;
    const value = store.get(key)!;
    const previous = parts[0];
    const path = mapPath(previous);
    if (path === undefined) {
      replacements.push({ previous: key, value, paths: [] });
      continue;
    }
    parts[0] = path;
    replacements.push({ previous: key, key: JSON.stringify(parts),
      value: transform ? transform(value, path, previous) : value, paths: [path] });
  }
  store.replaceEntries(replacements);
};
