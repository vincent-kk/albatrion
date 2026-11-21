import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { BlueprintNode } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import { WriteOption } from '../../../../types/value';
import { BATCH_HOST_SOURCE } from '../../../../utils/batchHostSource';
import { writeObjectKey } from '../../../../utils/writeObjectKey';
import { hasMarkedOutput } from './hasMarkedOutput';
import { mergeMarkedValue } from './mergeMarkedValue';

/**
 * Replace one marked path while retaining untouched committed references.
 * @param current - Candidate value at this level
 * @param names - Unescaped child names from the root to the target
 * @param incoming - New value for the target
 * @param option - Merge or replacement selection
 * @param node - Target's selected occurrence
 * @param template - Target's declaration when an occurrence is absent
 * @param isCommittedInput - Whether this value is the target's baseline, not a caller write
 * @param depth - Index of the next child address
 * @returns Candidate value with one path overlaid
 */
export const replaceAtPath = <Self extends FieldNodeRecord<Self>>(
  current: unknown,
  names: readonly string[],
  incoming: unknown,
  option: WriteOption,
  node?: Self,
  template?: BlueprintNode,
  isCommittedInput = false,
  depth = 0,
): unknown => {
  if (depth === names.length) {
    if (
      isCommittedInput &&
      node?.behavior.type === 'object' &&
      node.behavior.strategy === 'branch' &&
      node.source !== undefined &&
      incoming !== null &&
      typeof incoming === 'object'
    )
      return { ...incoming, [BATCH_HOST_SOURCE]: node.source };
    return option & WriteOption.Merge && !(option & WriteOption.Replace)
      ? mergeMarkedValue(node, current, incoming, template)
      : incoming;
  }

  const name = names[depth];
  if (isArray(current)) {
    const next = [...current];
    const index = Number(name);
    next[index] = replaceAtPath(
      next[index],
      names,
      incoming,
      option,
      node,
      template,
      isCommittedInput,
      depth + 1,
    );
    return next;
  }

  const isObject = current !== null && typeof current === 'object';
  const previous =
    isObject && hasOwnProperty(current, name)
      ? Reflect.get(current, name)
      : undefined;
  const child = replaceAtPath(
    previous,
    names,
    incoming,
    option,
    node,
    template,
    isCommittedInput,
    depth + 1,
  );
  const next = isObject ? { ...current } : {};
  writeObjectKey(next, name, child);

  const wrongSource = isObject
    ? Reflect.get(current, BATCH_HOST_SOURCE)
    : current;
  if (wrongSource !== undefined) {
    let childNode = node;
    while (childNode && childNode.depth > depth + 1)
      childNode = childNode.parent ?? undefined;
    if (
      isCommittedInput ||
      !hasMarkedOutput(child, childNode, childNode?.blueprintNode ?? template)
    )
      Object.defineProperty(next, BATCH_HOST_SOURCE, {
        value: wrongSource,
        enumerable: true,
        configurable: true,
      });
    else Reflect.deleteProperty(next, BATCH_HOST_SOURCE);
  }
  return next;
};
