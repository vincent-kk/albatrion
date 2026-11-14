import { isString } from '@winglet/common-utils/filter';
import { compilePointer, unescapePath } from '@winglet/json/pointer';

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
  const root: OperationNode = { replacement: undefined, children: undefined };
  let previousPrefix: string | undefined;
  let previousParent = root;
  for (const operation of operations) {
    const path = operation.path;
    const separator = isString(path) ? path.lastIndexOf('/') : -1;
    const prefix = separator < 0 ? undefined : path.slice(0, separator);
    let node: OperationNode;
    let token: string;
    if (prefix !== undefined && prefix === previousPrefix) {
      node = previousParent;
      token = unescapePath(path.slice(separator + 1));
    } else {
      const tokens = compilePointer(path);
      const start = tokens[0] === '#' || tokens[0] === '' ? 1 : 0;
      node = root;
      for (let index = start; index < tokens.length - 1; index++) {
        const children = (node.children ??= new Map());
        let child = children.get(tokens[index]);
        if (child === undefined) {
          child = { replacement: undefined, children: undefined };
          children.set(tokens[index], child);
        }
        node = child;
      }
      if (start >= tokens.length) {
        root.replacement = operation;
        root.children?.clear();
        previousPrefix = undefined;
        continue;
      }
      token = tokens[tokens.length - 1];
    }
    // Only the immediately preceding raw parent is cached; ancestor replacements reset it.
    previousPrefix = prefix;
    previousParent = node;
    const children = (node.children ??= new Map());
    let child = children.get(token);
    if (child === undefined) {
      child = { replacement: undefined, children: undefined };
      children.set(token, child);
    }
    child.replacement = operation;
    child.children?.clear();
  }
  return root;
}
