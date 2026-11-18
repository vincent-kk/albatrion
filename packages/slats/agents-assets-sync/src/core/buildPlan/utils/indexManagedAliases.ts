import type { Destination } from '../../agentTarget/index.js';
import { foldManagedPath } from './foldManagedPath.js';

/**
 * Indexes candidate file spellings once for every orphan scan in a plan.
 * @param destinations - resolved manifest destinations, including non-file entries
 * @returns file paths grouped by normalization key without consulting the filesystem
 */
export function indexManagedAliases(
  destinations: ReadonlyMap<string, Destination>,
): Map<string, string[]> {
  const aliases = new Map<string, string[]>();
  for (const [path, destination] of destinations) {
    if (destination.kind !== 'file') continue;
    const key = foldManagedPath(path);
    const paths = aliases.get(key);
    if (paths) paths.push(destination.dstAbs);
    else aliases.set(key, [destination.dstAbs]);
  }
  return aliases;
}
