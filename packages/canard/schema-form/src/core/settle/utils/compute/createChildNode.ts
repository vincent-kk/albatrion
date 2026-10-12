import type { BlueprintChildEntry } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';

/**
 * Create one occurrence and assign a never-reused key under an array branch.
 * @param host - Parent whose array key counter owns item identity
 * @param entry - Declared blueprint position
 * @returns New detached-from-shape occurrence
 */
export const createChildNode = <Self extends SchemaNodeRecord<Self>>(
  host: Self, entry: BlueprintChildEntry,
): Self => {
  const child = host.runtime.nodeFactory(entry, host, host.runtime);
  if (host.behavior.type === 'array' && host.behavior.strategy === 'branch')
    child.itemKey = host.nextItemKey++;
  return child;
};
