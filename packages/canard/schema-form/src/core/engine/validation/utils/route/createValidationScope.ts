import type { Fn } from '@aileron/declare';

import {
  JSONPointer as $,
  isDescendantPath,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';

/**
 * Index requested identities and strict ancestor paths for one routing pass.
 * @param targets - Same-runtime occurrences, including recorded detached scopes
 * @returns Membership predicate that excludes a different node at an equal path
 */
export const createValidationScope = <Self extends FieldNodeRecord<Self>>(
  targets: readonly Self[],
): Fn<[node: Self], boolean> => {
  const only = targets.length === 1 ? targets[0] : undefined;
  if (only)
    return (node) => node === only || isDescendantPath(node.path, only.path);
  const identities = new Set(targets);
  const targetPaths = new Set(targets.map((target) => target.path));
  return (node) => {
    if (identities.has(node)) return true;
    let path = node.path;
    while (path) {
      path = resolvePointer(path, $.Parent);
      if (targetPaths.has(path)) return true;
    }
    return false;
  };
};
