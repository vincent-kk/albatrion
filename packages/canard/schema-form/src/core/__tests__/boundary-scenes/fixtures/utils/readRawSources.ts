import { isObject } from '@winglet/common-utils/filter';

import { type FieldNode, isUnionNode } from '../../../../surface';
import { collectFieldNodes } from './collectFieldNodes';
import { readPointerOwner } from './readPointerOwner';

/**
 * Read the sources a form holds, as a new load would receive them: the output value with every union's stored
 * source in place of its presented value. Retained inactive values and values the output omits are not included.
 * @param root - The form root
 * @returns A fresh value tree
 */
export const readRawSources = (root: FieldNode): unknown => {
  const output: unknown = structuredClone(root.outputValue);
  for (const node of collectFieldNodes(root))
    if (isUnionNode(node) && node.source !== undefined)
      placeAt(output, node.path, structuredClone(node.source));
  return output;
};

/** Write `value` at `path` inside `target` when the path's holder exists; otherwise leave `target` as it is. */
const placeAt = (target: unknown, path: string, value: unknown): void => {
  const { owner, key } = readPointerOwner(target, path);
  if (isObject(owner)) Reflect.set(owner, key, value);
};
