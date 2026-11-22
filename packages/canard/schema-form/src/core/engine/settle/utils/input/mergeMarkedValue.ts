import { hasOwnProperty } from '@winglet/common-utils/lib';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { FieldNodeWriteKind } from '../../../types/value';
import {
  BATCH_HOST_SOURCE,
  writeBatchHostSource,
} from '../../../utils/batchHostSource';
import { writeObjectKey } from '../../../utils/writeObjectKey';
import type { WriteRange } from '../../types/writeRange';
import { getDeclaredChildNames } from '../declarations/getDeclaredChildNames';
import { canReleaseCallerHost } from './canReleaseCallerHost';
import { decideAddressWrite } from './decideAddressWrite';
import { getWriteChild } from './getWriteChild';
import { hasCallerInputOutput } from './hasCallerInputOutput';
import { isPlain } from './isPlain';

/**
 * Merge marked branch objects with the same child boundaries as a settled Merge.
 * @param node - Live target supplying selected bindings, when present.
 * @param previous - Earlier composed value, never mutated.
 * @param incoming - Partial input; arrays, terminals and extras replace whole values.
 * @param template - Declaration supplying bindings for inactive fields.
 * @param ranges - Optional sink for the physical decisions in call order
 * @param source - Binding origin for the physical decisions
 * @param path - Canonical storage path at this depth
 * @param mode - Direct input keeps non-enumerable declared fields
 * @returns A candidate preserving omitted branch keys.
 */
export const mergeMarkedValue = <Self extends FieldNodeRecord<Self>>(
  node: Self | undefined,
  previous: unknown,
  incoming: unknown,
  template: BlueprintNode | undefined = node?.blueprintNode,
  ranges?: WriteRange[],
  source?: FieldNodeWriteKind,
  path = node?.path ?? '',
  mode: 'root' | 'direct' = 'root',
): unknown => {
  if (!template || !decideAddressWrite(template, incoming, true)) {
    if (ranges && source !== undefined) ranges.push({ path, source });
    return incoming;
  }
  const previousObject = isPlain(previous) ? previous : undefined;
  const wrongSource =
    previousObject === undefined
      ? previous
      : Reflect.get(previousObject, BATCH_HOST_SOURCE);
  const ownInput = { ...incoming };
  if (mode === 'direct')
    for (const name of getDeclaredChildNames(template))
      if (!hasOwnProperty(ownInput, name) && hasOwnProperty(incoming, name))
        writeObjectKey(ownInput, name, incoming[name]);
  if (ranges && source !== undefined)
    ranges.push({ path, source, partial: ownInput });
  const next = previousObject ? { ...previousObject, ...ownInput } : ownInput;
  let hasChildOutput = false;
  for (const name of Object.keys(ownInput)) {
    const { child, entry } = getWriteChild(template, node, name);
    const binding = child?.blueprintNode ?? entry?.node;
    const childRange = ranges?.length ?? -1;
    const value = mergeMarkedValue(
      child,
      previousObject && hasOwnProperty(previousObject, name)
        ? previousObject[name]
        : undefined,
      ownInput[name],
      binding,
      ranges,
      source,
      ranges ? appendSegment(path, name) : undefined,
      mode,
    );
    writeObjectKey(next, name, value);
    const childPartial = ranges?.[childRange]?.partial;
    if (childPartial && ownInput !== next)
      writeObjectKey(ownInput, name, childPartial);
    if (
      wrongSource !== undefined &&
      !hasChildOutput &&
      binding &&
      (child || !node)
    )
      hasChildOutput = hasCallerInputOutput(value, child, binding);
  }
  if (wrongSource !== undefined)
    writeBatchHostSource(
      next,
      canReleaseCallerHost(wrongSource, hasChildOutput)
        ? undefined
        : wrongSource,
    );
  return next;
};
