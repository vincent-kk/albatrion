import { vi } from 'vitest';

import { populateNodeChildren } from '../../populateNodeChildren';
import type { AnalysisContext, MutableNode, SchemaInput } from '../../type';

/**
 * Count only one host's child preparation, with recursive construction replaced.
 * @param context - Original fragment ownership for the supplied host
 * @param source - Host whose declarations are preserved in a writable copy
 * @returns Enumeration/allocation counts and ordered inputs sent to construction
 */
export const countChildEnumeration = (
  context: AnalysisContext,
  source: MutableNode,
) => {
  const counts = {
    snapshots: 0,
    snapshotEntries: 0,
    mapAllocations: 0,
    mapPasses: 0,
    mapEntries: 0,
  };
  const inputs: { path: string; inputs: readonly SchemaInput[] }[] = [];
  const nativeEntries = Object.entries;
  const entries = vi.spyOn(Object, 'entries').mockImplementation((value) => {
    const result = nativeEntries(value);
    counts.snapshots++;
    counts.snapshotEntries += result.length;
    return result;
  });
  class CountedMap<Key, Value> extends Map<Key, Value> {
    constructor() {
      super();
      counts.mapAllocations++;
    }

    /** Count a complete traversal without replacing the native iterator. */
    [Symbol.iterator]() {
      counts.mapPasses++;
      counts.mapEntries += this.size;
      return super[Symbol.iterator]();
    }
  }
  vi.stubGlobal('Map', CountedMap);
  try {
    populateNodeChildren(
      context,
      { ...source, childEntries: [] },
      (_context, children, path) => {
        inputs.push({ path, inputs: children });
        return [];
      },
    );
  } finally {
    entries.mockRestore();
    vi.unstubAllGlobals();
  }
  return { ...counts, inputs };
};
