import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { FieldNodeWriteKind } from '../../../types/value';
import type { WriteOption } from '../../../types/value';
import {
  BATCH_HOST_SOURCE,
  writeBatchHostSource,
} from '../../../utils/batchHostSource';
import { writeObjectKey } from '../../../utils/writeObjectKey';
import type { WriteRange } from '../../types/writeRange';
import { canReleaseCallerHost } from './canReleaseCallerHost';
import { hasCallerInputOutput } from './hasCallerInputOutput';
import { isMergeWrite } from './isMergeWrite';
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
 * @param ranges - Batch physical range sink, omitted for read-only composition
 * @param source - Binding origin and target address for the mark
 * @param path - Target's physical address
 * @param isIndirect - Whether the target is a constituent of a whole virtual write
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
  ranges?: WriteRange[],
  source?: FieldNodeWriteKind,
  path = node?.path ?? '',
  isIndirect?: true,
): unknown => {
  if (depth === names.length) {
    if (
      isCommittedInput &&
      node?.behavior.type === 'object' &&
      node.behavior.strategy === 'branch' &&
      node.source !== undefined &&
      incoming !== null &&
      typeof incoming === 'object'
    ) {
      const next = { ...incoming };
      writeBatchHostSource(next, node.source);
      return next;
    }
    if (isMergeWrite(option))
      return mergeMarkedValue(
        node,
        current,
        incoming,
        template,
        ranges,
        source,
        path,
      );
    if (ranges && source !== undefined) {
      const range: WriteRange = { path, source };
      if (isIndirect) range.isIndirect = true;
      ranges.push(range);
    }
    return incoming;
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
      ranges,
      source,
      path,
      isIndirect,
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
    ranges,
    source,
    path,
    isIndirect,
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
    const hasOutput =
      !isCommittedInput &&
      !!childNode &&
      hasCallerInputOutput(child, childNode);
    writeBatchHostSource(
      next,
      canReleaseCallerHost(wrongSource, hasOutput) ? undefined : wrongSource,
    );
  }
  return next;
};
