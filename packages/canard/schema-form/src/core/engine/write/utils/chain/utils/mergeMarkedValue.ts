import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { BlueprintNode } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import { BATCH_HOST_SOURCE } from '../../../../utils/batchHostSource';
import { writeObjectKey } from '../../../../utils/writeObjectKey';
import { hasMarkedOutput } from './hasMarkedOutput';

/**
 * Merge marked branch objects with the same child boundaries as a settled Merge.
 * @param node - Live target supplying selected bindings, when present.
 * @param previous - Earlier composed value, never mutated.
 * @param incoming - Partial input; arrays, terminals and extras replace whole values.
 * @param template - Declaration supplying bindings for inactive fields.
 * @returns A candidate preserving omitted branch keys.
 */
export const mergeMarkedValue = <Self extends FieldNodeRecord<Self>>(
  node: Self | undefined,
  previous: unknown,
  incoming: unknown,
  template: BlueprintNode | undefined = node?.blueprintNode,
): unknown => {
  if (
    template?.kind !== 'object' ||
    template.strategy !== 'branch' ||
    incoming === null ||
    typeof incoming !== 'object' ||
    isArray(incoming)
  )
    return incoming;
  const previousObject =
    previous !== null && typeof previous === 'object' && !isArray(previous)
      ? previous
      : undefined;
  const wrongSource =
    previousObject === undefined
      ? previous
      : Reflect.get(previousObject, BATCH_HOST_SOURCE);
  const next: Record<string, unknown> = { ...previousObject, ...incoming };
  let hasChildOutput = false;
  for (const name of Object.keys(incoming)) {
    const child = node?.childrenByName?.[name];
    const binding =
      child?.blueprintNode ??
      template.childEntries.find((entry) => entry.name === name)?.node;
    let value = Reflect.get(incoming, name);
    if (binding?.kind === 'object' && binding.strategy === 'branch') {
      value = mergeMarkedValue(
        child,
        previousObject && hasOwnProperty(previousObject, name)
          ? Reflect.get(previousObject, name)
          : undefined,
        value,
        binding,
      );
      writeObjectKey(next, name, value);
    }
    if (
      wrongSource !== undefined &&
      !hasChildOutput &&
      binding &&
      (child || !node)
    )
      hasChildOutput = hasMarkedOutput(value, child, binding);
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
