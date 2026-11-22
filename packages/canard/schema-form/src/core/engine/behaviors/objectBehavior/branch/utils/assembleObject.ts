import { isArray } from '@winglet/common-utils/filter';

import type { Dictionary } from '@aileron/declare';

import type { Behavior, FieldNodeRecord } from '../../../../record';
import { getHostDerived } from '../../../../utils/cache/derivedRecords';
import { objectKeyCounts } from '../../../../utils/cache/valueMemos';
import { writeObjectKey } from '../../../../utils/writeObjectKey';
import { getStaticChoices } from '../../../utils/options/getStaticChoices';
import { patchObjectKeys } from './patchObjectKeys';
import { assembleObjectValue } from './assembleObjectValue';

/**
 * Store the shape proven during assembly for the next value-only patch.
 * @param node - Object occurrence owning the shape.
 * @param children - Current child identity used by the shape proof.
 * @param result - Assembled stored value.
 * @param names - Own keys in the assembled order.
 * @returns The same assembled value.
 */
const rememberObjectShape = <Node>(
  node: FieldNodeRecord<Node>,
  children: readonly Node[],
  result: object,
  names: readonly string[],
): object => {
  (node.runtime.objectShapes ??= new WeakMap()).set(node, {
    children,
    schema: node.schema,
    extras: node.extras,
    names,
  });
  objectKeyCounts.set(result, names.length);
  return result;
};

/** Combine live child projections and undeclared input in stable host order. */
export const assembleObject: Behavior['assemble'] = (
  node,
  children,
  recalculated,
  hint,
) => {
  if (node.source === null) return null;
  const previous = node.storedValue;
  const stable = node.runtime.objectShapes?.get(node);
  if (
    recalculated &&
    hint &&
    stable?.children === children &&
    stable.schema === node.schema &&
    stable.extras === node.extras &&
    previous !== null &&
    typeof previous === 'object' &&
    objectKeyCounts.get(previous) === stable.names.length
  ) {
    const result = patchObjectKeys(previous, recalculated, stable.names.length);
    if (result !== undefined) {
      hint.isIncremental = true;
      if (result !== previous) objectKeyCounts.set(result, stable.names.length);
      return result;
    }
  }
  if (
    stable?.children === children &&
    stable.schema === node.schema &&
    stable.extras === undefined &&
    node.extras === undefined &&
    previous !== null &&
    typeof previous === 'object' &&
    !isArray(previous)
  ) {
    let sameKeys = true;
    const oldNames = Object.keys(previous);
    if (oldNames.length !== stable.names.length) sameKeys = false;
    else
      for (let index = 0; index < oldNames.length; index++)
        if (oldNames[index] !== stable.names[index]) {
          sameKeys = false;
          break;
        }
    if (sameKeys) {
      const result = patchObjectKeys(previous, children, oldNames.length);
      if (result !== undefined) {
        objectKeyCounts.set(result, oldNames.length);
        return result;
      }
    }
  }
  const propertyOrder = getStaticChoices(node.schema).propertyOrder;
  const entries = node.blueprintNode.childEntries;
  if (
    (previous === undefined || previous === null) &&
    node.extras === undefined &&
    propertyOrder.length === 0 &&
    entries.length === children.length
  ) {
    const result: Dictionary<unknown> = {};
    const names: string[] = [];
    let aligned = true;
    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      if (
        child === null ||
        typeof child !== 'object' ||
        !('name' in child) ||
        typeof child.name !== 'string' ||
        !('storedOutputValue' in child) ||
        entries[index].name !== child.name
      ) {
        aligned = false;
        break;
      }
      if (child.storedOutputValue !== undefined) {
        names.push(child.name);
        writeObjectKey(result, child.name, child.storedOutputValue);
      }
    }
    if (aligned) {
      return rememberObjectShape(node, children, result, names);
    }
  }
  const rawExtras = node.extras;
  const extras =
    rawExtras !== null && typeof rawExtras === 'object' && !isArray(rawExtras)
      ? rawExtras
      : undefined;
  if (
    previous === undefined &&
    children.length === 0 &&
    propertyOrder.length === 0 &&
    entries.length === 0 &&
    extras
  ) {
    const names = Object.keys(extras);
    const result: Dictionary<unknown> = {};
    for (const name of names)
      writeObjectKey(result, name, Reflect.get(extras, name));
    return rememberObjectShape(node, children, result, names);
  }
  const childValues = new Map<string, unknown>();
  for (const child of children)
    if (
      child !== null &&
      typeof child === 'object' &&
      'name' in child &&
      typeof child.name === 'string' &&
      'storedOutputValue' in child
    )
      childValues.set(child.name, child.storedOutputValue);
  const names: string[] = [];
  // Each inner map's first value is the first childEntries position.
  const orderIndex = getHostDerived<
    'childOrderIndex',
    ReadonlyMap<string, ReadonlyMap<object, number>>
  >(node.blueprintNode).childOrderIndex;
  const result = assembleObjectValue(
    previous,
    entries,
    propertyOrder,
    orderIndex,
    childValues,
    extras,
    names,
  );
  return rememberObjectShape(node, children, result, names);
};
