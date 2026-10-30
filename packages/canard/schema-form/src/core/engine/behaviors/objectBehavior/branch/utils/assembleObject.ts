import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Behavior } from '../../../../record';
import { getHostDerived } from '../../../../utils/cache/derivedRecords';
import { objectKeyCounts } from '../../../../utils/cache/valueMemos';
import { writeObjectKey } from '../../../../utils/writeObjectKey';
import { getStaticChoices } from '../../../utils/options/getStaticChoices';

/** Combine live child projections and undeclared input in stable host order. */
export const assembleObject: Behavior['assemble'] = (
  node,
  children,
  recalculated,
  hint,
) => {
  const previous = node.local;
  const stable = node.runtime.objectShapes?.get(node);
  if (
    recalculated &&
    hint &&
    stable?.children === children &&
    stable.schema === node.schema &&
    stable.undeclaredValues === node.undeclaredValues &&
    previous !== null &&
    typeof previous === 'object' &&
    objectKeyCounts.get(previous) === stable.names.length
  ) {
    let patch: Record<string, unknown> | undefined;
    let sameKeys = true;
    for (const child of recalculated) {
      if (
        child === null ||
        typeof child !== 'object' ||
        !('name' in child) ||
        typeof child.name !== 'string' ||
        !('emit' in child)
      ) {
        sameKeys = false;
        break;
      }
      const oldHasKey = hasOwnProperty(previous, child.name);
      if ((child.emit === undefined) === oldHasKey) {
        sameKeys = false;
        break;
      }
      if (
        oldHasKey &&
        !Object.is(child.emit, Reflect.get(previous, child.name))
      ) {
        if (!patch) patch = { ...previous };
        writeObjectKey(patch, child.name, child.emit);
      }
    }
    if (sameKeys) {
      hint.incremental = true;
      if (patch) objectKeyCounts.set(patch, stable.names.length);
      return patch ?? previous;
    }
  }
  if (
    stable?.children === children &&
    stable.schema === node.schema &&
    stable.undeclaredValues === undefined &&
    node.undeclaredValues === undefined &&
    previous !== null &&
    typeof previous === 'object' &&
    !isArray(previous)
  ) {
    let patch: Record<string, unknown> | undefined;
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
      for (const child of children) {
        if (
          child === null ||
          typeof child !== 'object' ||
          !('name' in child) ||
          typeof child.name !== 'string' ||
          !('emit' in child)
        ) {
          sameKeys = false;
          break;
        }
        const oldHasKey = hasOwnProperty(previous, child.name);
        if ((child.emit === undefined) === oldHasKey) {
          sameKeys = false;
          break;
        }
        if (
          oldHasKey &&
          !Object.is(child.emit, Reflect.get(previous, child.name))
        ) {
          if (!patch) patch = { ...previous };
          writeObjectKey(patch, child.name, child.emit);
        }
      }
    }
    if (sameKeys) {
      objectKeyCounts.set(patch ?? previous, stable.names.length);
      return patch ?? previous;
    }
  }
  const preferred = getStaticChoices(node.schema).propertyOrder;
  const entries = node.blueprintNode.childEntries;
  if (
    previous === undefined &&
    node.undeclaredValues === undefined &&
    preferred.length === 0 &&
    entries.length === children.length
  ) {
    const result: Record<string, unknown> = {};
    const names: string[] = [];
    let aligned = true;
    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      if (
        child === null ||
        typeof child !== 'object' ||
        !('name' in child) ||
        typeof child.name !== 'string' ||
        !('emit' in child) ||
        entries[index].name !== child.name
      ) {
        aligned = false;
        break;
      }
      if (child.emit !== undefined) {
        names.push(child.name);
        writeObjectKey(result, child.name, child.emit);
      }
    }
    if (aligned) {
      (node.runtime.objectShapes ??= new WeakMap()).set(node, {
        children,
        schema: node.schema,
        undeclaredValues: node.undeclaredValues,
        names,
      });
      objectKeyCounts.set(result, names.length);
      return result;
    }
  }
  const extra = node.undeclaredValues;
  const extras =
    extra !== null && typeof extra === 'object' && !isArray(extra)
      ? extra
      : undefined;
  if (
    previous === undefined &&
    children.length === 0 &&
    preferred.length === 0 &&
    entries.length === 0 &&
    extras
  ) {
    const names = Object.keys(extras);
    const result: Record<string, unknown> = {};
    for (const name of names)
      writeObjectKey(result, name, Reflect.get(extras, name));
    (node.runtime.objectShapes ??= new WeakMap()).set(node, {
      children,
      schema: node.schema,
      undeclaredValues: node.undeclaredValues,
      names,
    });
    objectKeyCounts.set(result, names.length);
    return result;
  }
  const childValues = new Map<string, unknown>();
  for (const child of children)
    if (
      child !== null &&
      typeof child === 'object' &&
      'name' in child &&
      typeof child.name === 'string' &&
      'emit' in child
    )
      childValues.set(child.name, child.emit);
  const names: string[] = [];
  const seen = new Set<string>();

  for (const name of preferred) {
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
  const orderIndex = getHostDerived<
    'childOrderIndex',
    ReadonlyMap<string, ReadonlyMap<object, number>>
  >(node.blueprintNode).childOrderIndex;
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
    if (
      names.length === oldNames.length &&
      names.every((name, index) => name === oldNames[index])
    ) {
      let patch: Record<string, unknown> | undefined;
      for (const name of names) {
        const value = childValues.has(name)
          ? childValues.get(name)
          : extras
            ? Reflect.get(extras, name)
            : undefined;
        if (!Object.is(value, Reflect.get(previous, name))) {
          if (!patch) patch = { ...previous };
          writeObjectKey(patch, name, value);
        }
      }
      (node.runtime.objectShapes ??= new WeakMap()).set(node, {
        children,
        schema: node.schema,
        undeclaredValues: node.undeclaredValues,
        names,
      });
      objectKeyCounts.set(patch ?? previous, names.length);
      return patch ?? previous;
    }
  }
  const result: Record<string, unknown> = {};
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
  (node.runtime.objectShapes ??= new WeakMap()).set(node, {
    children,
    schema: node.schema,
    undeclaredValues: node.undeclaredValues,
    names,
  });
  objectKeyCounts.set(result, names.length);
  return result;
};
