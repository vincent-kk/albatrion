import type { DispatchTestNode } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';

/**
 * Read a statically declared child from a committed test tree.
 * @param parent - Branch that must own the requested child
 * @param name - Authored child key
 * @returns Child record or a fixture setup failure
 */
export const getDispatchChild = (
  parent: DispatchTestNode,
  name: string,
): DispatchTestNode => {
  const child = parent.structure?.[name];
  if (!child) throw new Error(`Missing test child ${name}`);
  return child;
};
