import { compilePointer } from '@winglet/json/pointer';

import type { OperationNode, OutputOperation } from '../type';

/**
 * Fold ordered replacements into a path overlay without touching replacement values.
 * @param operations Scan-order operations; later ancestor replacements discard older descendants.
 * @returns Overlay keyed by decoded pointer segments, retaining child insertion order.
 * @throws Existing JSON Pointer errors for malformed paths.
 */
export function buildOperationTree(
  operations: readonly OutputOperation[],
): OperationNode {
  const root: OperationNode = { children: new Map() };
  for (const operation of operations) {
    const tokens = compilePointer(operation.path);
    let node = root;
    for (
      let index = tokens[0] === '#' || tokens[0] === '' ? 1 : 0;
      index < tokens.length;
      index++
    ) {
      const token = tokens[index];
      let child = node.children.get(token);
      if (child === undefined) {
        child = { children: new Map() };
        node.children.set(token, child);
      }
      node = child;
    }
    node.replacement = operation;
    node.children.clear();
  }
  return root;
}
