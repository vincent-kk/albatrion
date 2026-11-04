import type { DispatchTestNode } from '../../../../__tests__/fixtures/createDispatchTree';
import { getGateRegistry } from '../../../utils/gates/getGateRegistry';

/**
 * Observe the tree's gate registry by path, without node identities, and flag entries held by departed nodes.
 * Reads the registry's private path and location indexes reflectively; a branchless tree has none.
 * @param root - Tree whose runtime owns the registry
 * @param departed - Nodes that left the tree; none of them may remain registered
 * @returns Registered paths with kind, liveness and occurrence count; location bucket sizes; departed paths still registered
 */
export const observeGateRegistry = (
  root: DispatchTestNode,
  departed: ReadonlySet<unknown>,
): { paths: unknown[]; locations: unknown[]; stale: string[] } | null => {
  const registry = getGateRegistry(root.runtime);
  const byPath: unknown = Reflect.get(registry, 'byPath');
  const byLocation: unknown = Reflect.get(registry, 'byLocation');
  if (!(byPath instanceof Map) || !(byLocation instanceof Map)) return null;
  const paths: unknown[] = [];
  const stale: string[] = [];
  for (const [path, entry] of byPath) {
    const node: unknown = Reflect.get(entry, 'node');
    if (departed.has(node)) stale.push(path);
    paths.push([
      path,
      Reflect.get(entry, 'kind'),
      Reflect.get(Object(node), 'detached'),
      Reflect.get(entry, 'occurrences')?.length,
    ]);
  }
  const locations: unknown[] = [];
  for (const [path, entries] of byLocation)
    locations.push([path, entries instanceof Set ? entries.size : entries]);
  return { paths, locations, stale };
};
