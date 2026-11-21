import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Dictionary, Optional } from '@aileron/declare';

import type { BlueprintChildEntry } from '../../../../blueprint';
import { writeObjectKey } from '../../../../utils/writeObjectKey';
import { copyObjectValue } from './copyObjectValue';

/**
 * Assemble an object in its canonical order without accessing node state.
 * @param previous - Prior stored object eligible for reference reuse
 * @param entries - Blueprint declarations in authored order
 * @param propertyOrder - Explicit priority keys from the selected schema
 * @param orderIndex - Optional indexed proof of first declaration positions
 * @param childValues - Active child outputs, including undefined for omitted children
 * @param extras - Undeclared own keys in assignment order
 * @param names - Empty caller-owned buffer receiving the chosen order
 * @returns Stored object using the previous reference when its keys and values match
 */
export const assembleObjectValue = (
  previous: unknown,
  entries: readonly BlueprintChildEntry[],
  propertyOrder: readonly string[],
  orderIndex: ReadonlyMap<string, ReadonlyMap<object, number>> | undefined,
  childValues: ReadonlyMap<string, unknown>,
  extras: object | undefined,
  names: string[],
): object => {
  const seen = new Set<string>();
  for (const name of propertyOrder) {
    if (childValues.has(name)) {
      if (childValues.get(name) !== undefined && !seen.has(name)) {
        names.push(name);
        seen.add(name);
      }
    } else if (extras && hasOwnProperty(extras, name) && !seen.has(name)) {
      names.push(name);
      seen.add(name);
    }
  }
  let ordered: { name: string; rank: number }[] | undefined;
  if (orderIndex) {
    ordered = [];
    for (const name of childValues.keys()) {
      const rank = orderIndex.get(name)?.values().next().value;
      if (rank === undefined) {
        ordered = undefined;
        break;
      }
      ordered.push({ name, rank });
    }
    ordered?.sort((left, right) => left.rank - right.rank);
  }
  if (ordered) {
    for (const { name } of ordered)
      if (childValues.get(name) !== undefined && !seen.has(name)) {
        names.push(name);
        seen.add(name);
      }
  } else
    for (const entry of entries) {
      const name = entry.name;
      if (
        childValues.has(name) &&
        childValues.get(name) !== undefined &&
        !seen.has(name)
      ) {
        names.push(name);
        seen.add(name);
      }
    }
  if (extras)
    for (const name of Object.keys(extras))
      if (!childValues.has(name) && !seen.has(name)) {
        names.push(name);
        seen.add(name);
      }

  if (previous !== null && typeof previous === 'object' && !isArray(previous)) {
    const oldNames = Object.keys(previous);
    let matches = names.length === oldNames.length;
    if (matches) {
      for (let index = 0, count = names.length; index < count; index++) {
        const name = names[index];

        if (!(name === oldNames[index])) {
          matches = false;
          break;
        }
      }
    }
    if (matches) {
      let patch: Optional<Dictionary<unknown>>;
      for (const name of names) {
        const value = childValues.has(name)
          ? childValues.get(name)
          : extras
            ? Reflect.get(extras, name)
            : undefined;
        if (!Object.is(value, Reflect.get(previous, name))) {
          if (!patch) patch = copyObjectValue(previous, names.length);
          writeObjectKey(patch, name, value);
        }
      }
      return patch ?? previous;
    }
  }
  const result: Dictionary<unknown> = {};
  for (const name of names)
    writeObjectKey(
      result,
      name,
      childValues.has(name)
        ? childValues.get(name)
        : extras
          ? Reflect.get(extras, name)
          : undefined,
    );
  return result;
};
