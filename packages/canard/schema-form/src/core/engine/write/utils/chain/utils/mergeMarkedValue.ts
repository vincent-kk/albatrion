import { isArray } from '@winglet/common-utils/filter';

import type { FieldNodeRecord } from '../../../../record';

/**
 * Merge marked branch objects with the same child boundaries as a settled Merge.
 * @param node - Live target determining which nested values are independently editable.
 * @param previous - Earlier composed value, never mutated.
 * @param incoming - Partial input; arrays, terminals and extras replace whole values.
 * @returns A candidate preserving omitted branch keys.
 */
export const mergeMarkedValue = <Self extends FieldNodeRecord<Self>>(
  node: Self | undefined,
  previous: unknown,
  incoming: unknown,
): unknown => {
  if (
    node?.behavior.type !== 'object' ||
    node.behavior.strategy !== 'branch' ||
    previous === null ||
    incoming === null ||
    typeof previous !== 'object' ||
    typeof incoming !== 'object' ||
    isArray(previous) ||
    isArray(incoming)
  )
    return incoming;
  const next: Record<string, unknown> = { ...previous, ...incoming };
  for (const name of Object.keys(incoming)) {
    const child = node.childrenByName?.[name];
    if (
      child?.behavior.type !== 'object' ||
      child.behavior.strategy !== 'branch'
    )
      continue;
    Object.defineProperty(next, name, {
      value: mergeMarkedValue(
        child,
        Object.prototype.hasOwnProperty.call(previous, name)
          ? Reflect.get(previous, name)
          : undefined,
        Reflect.get(incoming, name),
      ),
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }
  return next;
};
