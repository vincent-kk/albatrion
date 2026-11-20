import { map as mapArray } from '@winglet/common-utils/array';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Nullable } from '@aileron/declare';

import type { FieldNodeRecord } from '../../../record';
import { interpretFieldNodeInput } from '../../../settle';
import { WriteOption } from '../../../types/value';
import { resolveStorageTargets } from '../../../utils/paths/resolveStorageTargets';
import { composeBatchValue } from './composeBatchValue';
import { replaceAtPath } from './utils/replaceAtPath';

/** Follow own properties only; a missing step or a primitive reads undefined. */
const readOwnPath = (value: unknown, names: readonly string[]): unknown => {
  for (const name of names)
    value =
      value !== null && typeof value === 'object' && hasOwnProperty(value, name)
        ? Reflect.get(value, name)
        : undefined;
  return value;
};

/**
 * Read a target's marked input for an updater without publishing it.
 * @param node - Target whose subtree may have pending marks
 * @returns The target's own committed value, or each live constituent's for a virtual target, with
 * the call-order marks overlaid; the parent's committed value can omit an emptied object, so it is
 * replaced at the target address before the marks; a virtual target reads its reference fields as a tuple.
 * Each node's input is interpreted under its static type as the settlement interprets it, so a read
 * sees what an earlier call produced; fills, derivation and projection do not run.
 */
export const readBatchValue = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): unknown => {
  const root = node.rootNode;
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
      base = replaceAtPath(base, names, node.storedValue, WriteOption.Overwrite);
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
        );
  }
  const value = readOwnPath(
    composeBatchValue(root, root.runtime.batchWrites ?? [], base),
    names,
  );
  if (!targets) return interpretFieldNodeInput(node.blueprintNode, value, node);
  const entries = node.parent?.blueprintNode.childEntries;
  return mapArray(targets, (target) => {
    const slot = readOwnPath(value, [target.name]);
    const template =
      target.node?.blueprintNode ??
      entries?.find((entry) => entry.name === target.name)?.node;
    return template
      ? interpretFieldNodeInput(template, slot, target.node)
      : slot;
  });
};
