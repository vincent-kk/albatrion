import { realpath } from 'node:fs/promises';
import { basename, dirname, join, sep } from 'node:path';

import type { ResolvedLocations } from '../../type.js';
import { findLinkedNames } from '../findLinkedNames.js';
import { groupByCachedAncestor } from '../groupByCachedAncestor.js';
import { locateDirectory } from '../locateDirectory.js';
import { isWithin } from '../isWithin.js';

/** Find the first escaped write, reusing directory listings within a group. */
export async function findWriteEscape(
  dstPaths: readonly string[],
  realRoot: string,
  resolved: ResolvedLocations,
): Promise<string | undefined> {
  const namesByDir = new Map<string, string[]>();
  for (const dstAbs of dstPaths) {
    const dir = dirname(dstAbs);
    const names = namesByDir.get(dir);
    if (names === undefined) namesByDir.set(dir, [basename(dstAbs)]);
    else names.push(basename(dstAbs));
  }
  // Deepest first: a deeper directory's walk lists its ancestors, which the
  // files written into those ancestors then reuse.
  const dirs = [...namesByDir.keys()].sort(
    (a, b) => b.split(sep).length - a.split(sep).length,
  );
  const escapes = await Promise.all(
    groupByCachedAncestor(dirs, resolved).map(async (group) => {
      for (const dir of group) {
        const names = namesByDir.get(dir) ?? [];
        const escape = await findEscape(dir, names, realRoot, resolved);
        if (escape !== null) return escape;
      }
      return null;
    }),
  );
  return escapes.find((found) => found !== null);
}

// The directory, or the file written into it, that carries a write outside
// `realRoot`; `null` when every write into `dir` stays inside.
async function findEscape(
  dir: string,
  names: readonly string[],
  realRoot: string,
  resolved: ResolvedLocations,
): Promise<string | null> {
  const located = await locateDirectory(dir, resolved);
  if (!isWithin(realRoot, located.real)) return dir;
  if (!located.exists) return null;
  const location = resolved.get(dir) ?? located;
  for (const name of await findLinkedNames(dir, names, location, resolved))
    if (!isWithin(realRoot, await realpath(join(dir, name)).catch(() => null)))
      return join(dir, name);
  return null;
}
