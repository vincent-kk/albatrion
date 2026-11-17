import { lstat } from 'node:fs/promises';
import { join } from 'node:path';

import type { ResolvedLocation, ResolvedLocations } from '../type.js';
import { listDirectory } from './listDirectory.js';

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
 * When the directory's listing is already cached, or at least
 * `LISTING_MIN_NAMES` names are written there, the listing (read once per run)
 * decides every name it shows exactly. Any other name is checked with
 * `lstat`: on a case-insensitive file system an unlisted name can still reach
 * an existing entry, a link included, under different case.
 *
 * @param dir - absolute directory that `location` describes and that exists
 * @param names - entry names the run writes into `dir`
 * @param location - `dir`'s current entry in `resolved`
 * @param resolved - per-run cache; `dir`'s entry gains `listing` when read
 * @returns the subset of `names` that are symbolic links
 */
export async function findLinkedNames(
  dir: string,
  names: readonly string[],
  location: ResolvedLocation,
  resolved: ResolvedLocations,
): Promise<string[]> {
  const listing =
    location.listing !== undefined || names.length >= LISTING_MIN_NAMES
      ? await listDirectory(dir, location, resolved)
      : undefined;
  const unlisted = names.filter((name) => !listing?.names.has(name));
  const stats = await Promise.all(
    unlisted.map((name) => lstat(join(dir, name)).catch(() => null)),
  );
  return [
    ...names.filter((name) => listing?.linkNames.has(name)),
    ...unlisted.filter((_, index) => stats[index]?.isSymbolicLink()),
  ];
}
