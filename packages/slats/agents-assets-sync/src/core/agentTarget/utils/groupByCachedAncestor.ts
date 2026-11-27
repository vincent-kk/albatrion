import { dirname } from 'node:path';

import type { ResolvedLocations } from '../type.js';

/**
 * Group directories by their nearest ancestor (or self) already in `resolved`.
 *
 * `locateDirectory` stops its walk at a cached directory, so two groups never
 * read the same uncached directory or list the same one: they can be checked
 * concurrently without repeating a call. With nothing cached, every directory
 * shares the file-system root and the result is a single group.
 *
 * @param dirs - absolute directories, in the order each group should keep
 * @param resolved - per-run cache, read only
 * @returns the groups, each in `dirs` order, ordered by first appearance
 */
export function groupByCachedAncestor(
  dirs: readonly string[],
  resolved: ResolvedLocations,
): string[][] {
  const groups = new Map<string, string[]>();
  for (const dir of dirs) {
    let anchor = dir;
    while (!resolved.has(anchor) && dirname(anchor) !== anchor)
      anchor = dirname(anchor);
    const group = groups.get(anchor);
    if (group === undefined) groups.set(anchor, [dir]);
    else group.push(dir);
  }
  return [...groups.values()];
}
