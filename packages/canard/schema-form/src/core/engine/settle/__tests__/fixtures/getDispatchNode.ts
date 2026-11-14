import type { DispatchTestNode } from '../../../__tests__/fixtures/createDispatchTree';

/**
 * Read declared children with an explicit failure when a required node is missing.
 * @param root - Live test occurrence from which child names are followed
 * @param names - Direct child names in order, including array slot names
 * @returns The required descendant; throws when a child is absent from the structure
 */
export const getDispatchNode = (
  root: DispatchTestNode,
  ...names: readonly string[]
): DispatchTestNode => {
  let node = root;
  for (const name of names) {
    const child = node.structure?.[name];
    if (!child) throw new Error(`No child ${name} under ${node.path}`);
    node = child;
  }
  return node;
};
