import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Behavior } from '../../../../record';
import { getStaticChoices } from '../../../utils/options/getStaticChoices';
import { writeObjectKey } from '../../utils/keys/writeObjectKey';
import { objectKeyCounts } from '../../utils/objectKeyCounts';

/** Last assembled shape allows a value-only write to patch its existing order. */
const STABLE_SHAPES = new WeakMap<object, {
  children: readonly unknown[];
  schema: unknown;
  extras: unknown;
  names: readonly string[];
}>();

/** Combine live child projections and undeclared input in stable host order. */
export const assembleObject: Behavior['assemble'] = (node, children, recalculated, hint) => {
  const previous = node.local;
  const stable = STABLE_SHAPES.get(node);
  if (recalculated && hint && stable?.children === children &&
    stable.schema === node.schema && stable.extras === node.extras &&
    previous !== null && typeof previous === 'object' &&
    objectKeyCounts.get(previous) === stable.names.length) {
    let patch: Record<string, unknown> | undefined;
    let sameKeys = true;
    for (const child of recalculated) {
      if (child === null || typeof child !== 'object' ||
        !('name' in child) || typeof child.name !== 'string' || !('emit' in child)) {
        sameKeys = false;
        break;
      }
      const oldHasKey = hasOwnProperty(previous, child.name);
      if ((child.emit === undefined) === oldHasKey) {
        sameKeys = false;
        break;
      }
      if (oldHasKey && !Object.is(child.emit, Reflect.get(previous, child.name))) {
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
  if (stable?.children === children && stable.schema === node.schema &&
    stable.extras === undefined &&
    node.extras === undefined && previous !== null &&
    typeof previous === 'object' && !isArray(previous)) {
    let patch: Record<string, unknown> | undefined;
    let sameKeys = true;
    const oldNames = Object.keys(previous);
    if (oldNames.length !== stable.names.length) sameKeys = false;
    else for (let index = 0; index < oldNames.length; index++)
      if (oldNames[index] !== stable.names[index]) {
        sameKeys = false;
        break;
      }
    if (sameKeys) {
      for (const child of children) {
        if (child === null || typeof child !== 'object' ||
          !('name' in child) || typeof child.name !== 'string' || !('emit' in child)) {
          sameKeys = false;
          break;
        }
        const oldHasKey = hasOwnProperty(previous, child.name);
        if ((child.emit === undefined) === oldHasKey) {
          sameKeys = false;
          break;
        }
        if (oldHasKey && !Object.is(child.emit, Reflect.get(previous, child.name))) {
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
  const preferred = getStaticChoices(node.schema).propertyKeys;
  const entries = node.blueprintNode.childEntries;
  if (previous === undefined && node.extras === undefined &&
    preferred.length === 0 && entries.length === children.length) {
    const result: Record<string, unknown> = {};
    const names: string[] = [];
    let aligned = true;
    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      if (child === null || typeof child !== 'object' ||
        !('name' in child) || typeof child.name !== 'string' || !('emit' in child) ||
        entries[index].name !== child.name) {
        aligned = false;
        break;
      }
      if (child.emit !== undefined) {
        names.push(child.name);
        writeObjectKey(result, child.name, child.emit);
      }
    }
    if (aligned) {
      STABLE_SHAPES.set(node, { children, schema: node.schema, extras: node.extras,
        names });
      objectKeyCounts.set(result, names.length);
      return result;
    }
  }
  const childValues = new Map<string, unknown>();
  for (const child of children)
    if (child !== null && typeof child === 'object' &&
      'name' in child && typeof child.name === 'string' && 'emit' in child)
      childValues.set(child.name, child.emit);
  const extra = node.extras;
  const extras = extra !== null && typeof extra === 'object' && !isArray(extra)
    ? extra
    : undefined;
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
  for (const entry of node.blueprintNode.childEntries) {
    const name = entry.name;
    if (childValues.has(name) && childValues.get(name) !== undefined &&
      !seen.has(name)) {
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
    if (names.length === oldNames.length && names.every((name, index) => name === oldNames[index])) {
      let patch: Record<string, unknown> | undefined;
      for (const name of names) {
        const value = childValues.has(name)
          ? childValues.get(name)
          : extras ? Reflect.get(extras, name) : undefined;
        if (!Object.is(value, Reflect.get(previous, name))) {
          if (!patch) patch = { ...previous };
          writeObjectKey(patch, name, value);
        }
      }
      STABLE_SHAPES.set(node, { children, schema: node.schema, extras: node.extras,
        names });
      objectKeyCounts.set(patch ?? previous, names.length);
      return patch ?? previous;
    }
  }
  const result: Record<string, unknown> = {};
  for (const name of names)
    writeObjectKey(result, name, childValues.has(name)
      ? childValues.get(name)
      : extras ? Reflect.get(extras, name) : undefined);
  STABLE_SHAPES.set(node, { children, schema: node.schema, extras: node.extras,
    names });
  objectKeyCounts.set(result, names.length);
  return result;
};
