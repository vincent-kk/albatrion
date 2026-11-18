import { stat } from 'node:fs/promises';

import type { Destination } from '../../agentTarget/index.js';

/**
 * Protect managed files whose directory spelling differs on an insensitive volume.
 * @param relPath - discovered manifest-relative spelling
 * @param abs - discovered file path
 * @param destinations - managed paths resolved for this plan
 * @returns whether the filesystem resolves a spelling variant to the same file
 */
export async function isManagedAlias(
  relPath: string,
  abs: string,
  destinations: ReadonlyMap<string, Destination>,
): Promise<boolean> {
  const folded = relPath.normalize('NFD').toLowerCase();
  for (const [known, destination] of destinations) {
    if (destination.kind !== 'file' || known.normalize('NFD').toLowerCase() !== folded) continue;
    try {
      const [found, managed] = await Promise.all([stat(abs), stat(destination.dstAbs)]);
      if (found.dev === managed.dev && found.ino === managed.ino) return true;
    } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error;
    }
  }
  return false;
}
