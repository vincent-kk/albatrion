import { readdir } from 'node:fs/promises';

import type {
  DirectoryListing,
  ResolvedLocation,
  ResolvedLocations,
} from '../type.js';

/**
 * Read an existing directory's entry names and link names once per run.
 *
 * @param dir - absolute directory that `location` describes
 * @param location - `dir`'s current entry in `resolved`
 * @param resolved - per-run cache; `dir`'s entry gains `listing` when read
 * @returns the listing; empty when the directory cannot be read
 */
export async function listDirectory(
  dir: string,
  location: ResolvedLocation,
  resolved: ResolvedLocations,
): Promise<DirectoryListing> {
  if (location.listing !== undefined) return location.listing;
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const listing: DirectoryListing = {
    names: new Set(entries.map((entry) => entry.name)),
    linkNames: new Set(
      entries
        .filter((entry) => entry.isSymbolicLink())
        .map((entry) => entry.name),
    ),
  };
  resolved.set(dir, { ...location, listing });
  return listing;
}
