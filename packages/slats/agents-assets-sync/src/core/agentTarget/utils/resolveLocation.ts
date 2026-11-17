import { lstat, realpath } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

import type { ResolvedLocation, ResolvedLocations } from '../type.js';

/**
 * Resolve where `path` lands once symbolic links are followed, reading a
 * missing path through its nearest existing ancestor.
 *
 * Each path is resolved at most once per `resolved` cache, and a missing
 * path reuses its parent's entry, so files sharing directories cost one
 * `realpath` per directory rather than per file.
 *
 * @param path - absolute path to resolve
 * @param resolved - per-run cache, filled as a side effect
 * @returns the real location, `null` when a dangling link is on the way, and
 *   whether the path itself exists
 */
export async function resolveLocation(
  path: string,
  resolved: ResolvedLocations,
): Promise<ResolvedLocation> {
  const cached = resolved.get(path);
  if (cached !== undefined) return cached;
  const real = await realpath(path).catch(() => null);
  let entry: ResolvedLocation = { real, exists: true };
  if (real === null) {
    const link = await lstat(path).catch(() => null);
    const parent = link?.isSymbolicLink()
      ? null
      : (await resolveLocation(dirname(path), resolved)).real;
    entry = { real: parent && join(parent, basename(path)), exists: false };
  }
  resolved.set(path, entry);
  return entry;
}
