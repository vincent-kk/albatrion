import { lstat, realpath } from 'node:fs/promises';
import { basename, dirname, join, relative } from 'node:path';

import type { ResolvedLocation, ResolvedLocations } from '../type.js';

/**
 * Resolve where `path` lands once symbolic links are followed, reading a
 * missing path through its nearest existing ancestor.
 *
 * Each path is resolved at most once per `resolved` cache. A path whose
 * nearest cached ancestor is missing costs no file-system call, so a new
 * install's directories cost one failing `realpath` and `lstat` per missing
 * level above the first new one, not per directory; an existing path costs
 * one `realpath`.
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
  const missing = missingUnderCachedAncestor(path, resolved);
  if (missing !== null) {
    resolved.set(path, missing);
    return missing;
  }
  const real = await realpath(path).catch(() => null);
  let entry: ResolvedLocation = { real, exists: true };
  if (real === null) {
    const link = await lstat(path).catch(() => null);
    const parentReal = link?.isSymbolicLink()
      ? null
      : (await resolveLocation(dirname(path), resolved)).real;
    entry = {
      real: parentReal && join(parentReal, basename(path)),
      exists: false,
    };
  }
  resolved.set(path, entry);
  return entry;
}

// A path below the nearest cached ancestor that is missing is missing too, and
// a dangling ancestor leaves it unresolvable: map lookups, no file-system call.
function missingUnderCachedAncestor(
  path: string,
  resolved: ResolvedLocations,
): ResolvedLocation | null {
  for (let dir = dirname(path); ; dir = dirname(dir)) {
    const entry = resolved.get(dir);
    if (entry !== undefined) {
      if (entry.exists) return null;
      const real = entry.real && join(entry.real, relative(dir, path));
      return { real, exists: false };
    }
    if (dirname(dir) === dir) return null;
  }
}
