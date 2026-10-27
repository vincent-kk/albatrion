import type { InactiveGeneration } from '../../types/inactiveValues';

/**
 * Qualify an untouched node cache without constructing candidate maps or arrays.
 * @param generation - Current bounded journal chain above its compacted base
 * @param path - Existing host path; prefix strings are made only by this reader
 * @returns Whether any unconsumed fact intersects this host's descendant range
 */
export const hasInactiveRangeChanges = (
  generation: InactiveGeneration,
  path: string,
): boolean => {
  const prefix = path + '/';
  let current: InactiveGeneration | undefined = generation;
  while (current) {
    for (const source of current.changes.values())
      if (!path || source.path === path || source.path.startsWith(prefix))
        return true;
    for (const changed of current.visibility.keys())
      if (!path || changed === path || changed.startsWith(prefix)) return true;
    current = current.parent;
  }
  return false;
};
