import type { Destination } from '../../agentTarget/index.js';
import { statFile } from '../../utils/statFile.js';
import { foldManagedPath } from './foldManagedPath.js';

/**
 * Check the filesystem only for orphan candidates with a managed spelling variant.
 * @param destinations Resolved manifest destinations for this plan.
 * @returns The candidate's alias test, sharing one lazy index across scans.
 */
export function createManagedAliasCheck(
  destinations: ReadonlyMap<string, Destination>,
) {
  let aliases: Map<string, string[]> | undefined;
  return async (relPath: string, abs: string): Promise<boolean> => {
    if (!aliases) {
      aliases = new Map();
      for (const [path, destination] of destinations) {
        if (destination.kind !== 'file') continue;
        const key = foldManagedPath(path);
        const paths = aliases.get(key);
        if (paths) paths.push(destination.dstAbs);
        else aliases.set(key, [destination.dstAbs]);
      }
    }
    const candidates = aliases.get(foldManagedPath(relPath));
    if (!candidates) return false;
    const orphan = statFile(abs);
    for (const candidate of candidates) {
      const [found, managed] = await Promise.all([orphan, statFile(candidate)]);
      if (!found) return false;
      if (managed && found.dev === managed.dev && found.ino === managed.ino)
        return true;
    }
    return false;
  };
}
