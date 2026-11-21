import { basename, dirname, join } from 'node:path';

import type { ResolvedLocation, ResolvedLocations } from '../type.js';
import { listDirectory } from './listDirectory.js';
import { resolveLocation } from './resolveLocation.js';

/**
 * Resolve a destination directory from its parent's listing where possible.
 *
 * Walking down from the nearest cached ancestor, each level is judged by the
 * listing of the level above: a listed name that is not a link sits at its
 * parent's real location, while a link or an unlisted name goes through
 * `resolveLocation`; below a missing level nothing is read at all. With the
 * destination roots and skill namespaces already cached by
 * `assertProjectPathsContained`, a subdirectory costs at most its
 * parent's listing, which the files written there reuse.
 *
 * @param dir - absolute destination directory
 * @param resolved - per-run cache, filled as a side effect
 * @returns the directory's real location and whether it exists
 */
export async function locateDirectory(
  dir: string,
  resolved: ResolvedLocations,
): Promise<ResolvedLocation> {
  const cached = resolved.get(dir);
  if (cached !== undefined) return cached;
  const parentPath = dirname(dir);
  if (parentPath === dir) return resolveLocation(dir, resolved);
  const parent = await locateDirectory(parentPath, resolved);
  if (!parent.exists || parent.real === null)
    return resolveLocation(dir, resolved);
  const listing = await listDirectory(parentPath, parent, resolved);
  const name = basename(dir);
  // An unlisted name may still reach an entry of different case on a
  // case-insensitive file system, so only an exact, non-link entry is derived.
  if (!listing.names.has(name) || listing.linkNames.has(name))
    return resolveLocation(dir, resolved);
  const entry = { real: join(parent.real, name), exists: true };
  resolved.set(dir, entry);
  return entry;
}
