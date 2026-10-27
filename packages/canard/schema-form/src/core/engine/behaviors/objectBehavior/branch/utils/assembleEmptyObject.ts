import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { FieldNodeRecord } from '../../../../record';
import { objectKeyCounts } from '../../../../utils/cache/valueMemos';
import { writeObjectKey } from '../../../../utils/writeObjectKey';

/** Preserve the empty-child generic extras path and its existing collection contract. */
export const assembleEmptyObject = <Node>(
  node: FieldNodeRecord<Node>,
  children: readonly Node[],
  preferred: readonly string[],
  extras: object | undefined,
): unknown => {
  const values = new Map<string, unknown>();
  const seen = new Set<string>();
  for (const name of preferred)
    if (extras && hasOwnProperty(extras, name) && !seen.has(name)) {
      seen.add(name);
      values.set(name, Reflect.get(extras, name));
    }
  if (extras)
    for (const name of Object.keys(extras))
      if (!seen.has(name)) {
        seen.add(name);
        values.set(name, Reflect.get(extras, name));
      }
  const names = [...values.keys()];
  (node.runtime.objectShapes ??= new WeakMap()).set(node, {
    children,
    schema: node.schema,
    undeclaredValues: node.undeclaredValues,
    names,
  });
  const previous = node.local;
  if (previous !== null && typeof previous === 'object' && !isArray(previous)) {
    const oldNames = Object.keys(previous);
    if (
      names.length === oldNames.length &&
      names.every((name, index) => name === oldNames[index])
    ) {
      let patch: Record<string, unknown> | undefined;
      for (const [name, value] of values)
        if (!Object.is(value, Reflect.get(previous, name))) {
          patch ??= { ...previous };
          writeObjectKey(patch, name, value);
        }
      objectKeyCounts.set(patch ?? previous, names.length);
      return patch ?? previous;
    }
  }
  const result: Record<string, unknown> = {};
  for (const [name, value] of values) writeObjectKey(result, name, value);
  objectKeyCounts.set(result, names.length);
  return result;
};
