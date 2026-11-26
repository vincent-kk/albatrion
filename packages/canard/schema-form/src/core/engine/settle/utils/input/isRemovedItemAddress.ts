import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { FieldNodeRecord } from '../../../record';

/** Read result below an array ancestor that no longer holds the item position. */
const REMOVED_POSITION = Symbol('removed item position');

/** Read an own property the way a path overlay does, or undefined. */
const readOwnKey = (host: unknown, name: string): unknown =>
  host !== null && typeof host === 'object' && hasOwnProperty(host, name)
    ? Reflect.get(host, name)
    : undefined;

/** Read a node's address in its root value, or `REMOVED_POSITION` below a lost item. */
const readAddress = <Self extends FieldNodeRecord<Self>>(
  value: unknown,
  node: Self,
): unknown => {
  const parent = node.__parent__;
  if (!parent) return value;
  const host = readAddress(value, parent);
  if (host === REMOVED_POSITION) return host;
  if (parent.behavior.type !== 'array') return readOwnKey(host, node.name);
  const index = Number(node.name);
  return isArray(host) && index < host.length ? host[index] : REMOVED_POSITION;
};

/**
 * Decide whether a composed value removed an item position on a node's path.
 * @param value - Composed value of the node's root, before the node's write
 * @param node - Occurrence a caller wrote through; a virtual group shares its slots' ancestors,
 * so the decision covers slots that have no live node
 * @returns Whether an array ancestor's value is not an array or is shorter than the item index
 * on the node's path, as an earlier write of the same batch can leave it
 */
export const isRemovedItemAddress = <Self extends FieldNodeRecord<Self>>(
  value: unknown,
  node: Self,
): boolean => readAddress(value, node) === REMOVED_POSITION;
