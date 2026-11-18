import { stat } from 'node:fs/promises';

import { foldManagedPath } from './foldManagedPath.js';

/**
 * Protect managed files whose directory spelling differs on an insensitive volume.
 * @param relPath - discovered manifest-relative spelling
 * @param abs - discovered file path
 * @param aliases - indexed candidate paths shared by every orphan scan
 * @returns whether the filesystem resolves a spelling variant to the same file
 */
export async function isManagedAlias(
  relPath: string,
  abs: string,
  aliases: ReadonlyMap<string, readonly string[]>,
): Promise<boolean> {
  for (const managedPath of aliases.get(foldManagedPath(relPath)) ?? []) {
    try {
      const [found, managed] = await Promise.all([
        stat(abs),
        stat(managedPath),
      ]);
      if (found.dev === managed.dev && found.ino === managed.ino) return true;
    } catch (error) {
      if (
        !(error instanceof Error && 'code' in error && error.code === 'ENOENT')
      )
        throw error;
    }
  }
  return false;
}
