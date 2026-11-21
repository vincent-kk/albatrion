import { hasOwnProperty } from '@winglet/common-utils/lib';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { FieldNodeWriteKind } from '../../../types/value';
import { BATCH_HOST_SOURCE } from '../../../utils/batchHostSource';
import { writeObjectKey } from '../../../utils/writeObjectKey';
import type { WriteRange } from '../../types/writeRange';
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
): unknown => {
  if (!template || !decideAddressWrite(template, incoming, true)) {
    if (ranges && source !== undefined) ranges.push({ path, source });
    return incoming;
  }
  if (ranges && source !== undefined)
    ranges.push({ path, source, partial: incoming });
  const previousObject = isPlain(previous) ? previous : undefined;
  const wrongSource =
    previousObject === undefined
      ? previous
      : Reflect.get(previousObject, BATCH_HOST_SOURCE);
  const next: Record<string, unknown> = { ...previousObject, ...incoming };
  let hasChildOutput = false;
  for (const name of Object.keys(incoming)) {
    const { child, entry } = getWriteChild(template, node, name);
    const binding = child?.blueprintNode ?? entry?.node;
    const value = mergeMarkedValue(
      child,
      previousObject && hasOwnProperty(previousObject, name)
        ? previousObject[name]
        : undefined,
      incoming[name],
      binding,
      ranges,
      source,
      ranges ? appendSegment(path, name) : undefined,
    );
    writeObjectKey(next, name, value);
    if (
      wrongSource !== undefined &&
      !hasChildOutput &&
      binding &&
      (child || !node)
    )
      hasChildOutput = hasCallerInputOutput(value, child, binding);
  }
  if (wrongSource !== undefined) {
    if (hasChildOutput) Reflect.deleteProperty(next, BATCH_HOST_SOURCE);
    else
      Object.defineProperty(next, BATCH_HOST_SOURCE, {
        value: wrongSource,
        enumerable: true,
        configurable: true,
      });
  }
  return next;
};
