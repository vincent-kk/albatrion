import { lstat, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import type { ResolvedLocation, ResolvedLocations } from '../type.js';

/**
 * Fewest names written into one directory for which reading its listing
 * beats one `lstat` per name. A single name is always cheaper to `lstat`; from
 * two names on, one listing per directory per run serves every name, and the
 * directories this tool writes into hold little besides what it writes.
 */
const LISTING_MIN_NAMES = 2;

/**
 * Pick out the names in an existing directory that are symbolic links.
 *
 * Below `LISTING_MIN_NAMES` each name is checked with `lstat`; otherwise the
 * directory is listed once per run and the listing's link names are cached on
 * its entry in `resolved`. A name missing from the listing is not a link.
 *
 * @param dir - absolute directory that `location` describes and that exists
 * @param names - entry names the run writes into `dir`
 * @param location - `dir`'s current entry in `resolved`
 * @param resolved - per-run cache; `dir`'s entry gains `linkNames` when listed
 * @returns the subset of `names` that are symbolic links
 */
export async function findLinkedNames(
  dir: string,
  names: readonly string[],
  location: ResolvedLocation,
  resolved: ResolvedLocations,
): Promise<string[]> {
  if (names.length < LISTING_MIN_NAMES) {
    const stats = await Promise.all(
      names.map((name) => lstat(join(dir, name)).catch(() => null)),
    );
    return names.filter((_, index) => stats[index]?.isSymbolicLink());
  }
  let linkNames = location.linkNames;
  if (linkNames === undefined) {
    const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
    linkNames = new Set(
      entries
        .filter((entry) => entry.isSymbolicLink())
        .map((entry) => entry.name),
    );
    resolved.set(dir, { ...location, linkNames });
  }
  return names.filter((name) => linkNames.has(name));
}
