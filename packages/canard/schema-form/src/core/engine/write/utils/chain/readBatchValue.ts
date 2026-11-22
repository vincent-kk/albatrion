import { map as mapArray } from '@winglet/common-utils/array';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Nullable } from '@aileron/declare';

import type { FieldNodeRecord } from '../../../record';
import {
  composeBatchValue,
  readStoredInput,
  replaceAtPath,
} from '../../../settle';
import { WriteOption } from '../../../types/value';
import { resolveStorageTargets } from '../../../utils/paths/resolveStorageTargets';

/** An ancestor replacement can omit an address independently of its value. */
const OMITTED_ADDRESS = Symbol('omitted batch address');

/** Follow own properties, returning the fallback when an address is omitted. */
const readOwnPath = (
  value: unknown,
  names: readonly string[],
  omitted?: typeof OMITTED_ADDRESS,
): unknown => {
  for (const name of names) {
    if (
      value === null ||
      typeof value !== 'object' ||
      !hasOwnProperty(value, name)
    )
      return omitted;
    value = Reflect.get(value, name);
  }
  return value;
};

/**
 * Read a target's marked input for an updater without publishing it.
 * @param node - Target whose subtree may have pending marks
 * @returns The target's own committed value, or each live constituent's for a virtual target, with
 * the call-order marks overlaid; the parent's committed value can omit an emptied object, so it is
 * replaced at the target address before the marks; a virtual target reads its reference fields as a tuple.
 * Each node's input is interpreted under its static type as the settlement interprets it, so a read
 * sees what an earlier call produced. Only child emissions needed for the stored view
 * are projected; fills, derivation and publication do not run.
 */
export const readBatchValue = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): unknown => {
  const root = node.rootNode;
  const writes = root.runtime.batchWrites;
  if (!writes?.length) return node.storedValue;
  const targets = resolveStorageTargets(node);
  const names: string[] = [];
  for (
    let cursor: Nullable<Self> = targets ? node.parent : node;
    cursor && cursor !== root;
    cursor = cursor.parent
  )
    names.unshift(cursor.name);
  let base = root.storedValue;
  if (!targets) {
    if (readOwnPath(base, names) !== node.storedValue)
      base = replaceAtPath(
        base,
        names,
        node.storedValue,
        WriteOption.Overwrite,
        node,
        undefined,
        true,
      );
  } else {
    const host = readOwnPath(base, names);
    for (const target of targets)
      if (
        target.node &&
        readOwnPath(host, [target.name]) !== target.node.storedValue
      )
        base = replaceAtPath(
          base,
          [...names, target.name],
          target.node.storedValue,
          WriteOption.Overwrite,
          target.node,
          undefined,
          true,
        );
  }
  const value = readOwnPath(
    composeBatchValue(root, writes, base),
    names,
    OMITTED_ADDRESS,
  );
  if (!targets)
    return value === OMITTED_ADDRESS
      ? undefined
      : readStoredInput(node.blueprintNode, value, node);
  return mapArray(targets, (target) => {
    if (!target.node) return undefined;
    const slot = readOwnPath(value, [target.name], OMITTED_ADDRESS);
    return slot === OMITTED_ADDRESS
      ? undefined
      : readStoredInput(target.node.blueprintNode, slot, target.node);
  });
};
