import { EMPTY_ARRAY } from '@winglet/common-utils/constant';

import type { Optional } from '@aileron/declare';

import type { FieldNodeRecord } from '../../../record';
import type { ValidationIssue } from '../../types/issue';

/**
 * Read a node's displayed external and validator issues without recomputing them.
 * @param node - Occurrence whose current errors are requested.
 * @returns Stable ordered issues until either source changes.
 */
export const readFieldNodeErrors = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): readonly ValidationIssue[] => {
  const runtime = node.rootNode.runtime;
  if (node.detached)
    return runtime.detachedReads?.get(node)?.errors ?? EMPTY_ARRAY;
  const external = runtime.nodeErrors?.get(node);
  const validation = runtime.validationErrors?.get(node);

  const isIssues = (
    items: Optional<readonly unknown[]>,
  ): items is readonly ValidationIssue[] => {
    if (!items) return false;
    for (let index = 0, count = items.length; index < count; index++) {
      if (!(index in items)) continue;
      const item = items[index];
      if (
        item === null ||
        typeof item !== 'object' ||
        !('dataPath' in item) ||
        typeof item.dataPath !== 'string'
      )
        return false;
    }
    return true;
  };
  if (!isIssues(external))
    return isIssues(validation) ? validation : EMPTY_ARRAY;
  if (!isIssues(validation)) return external;
  const cached = runtime.combinedErrors?.get(node);
  if (
    cached?.external === external &&
    cached.validation === validation &&
    isIssues(cached.errors)
  )
    return cached.errors;
  const errors = [...external, ...validation];
  (runtime.combinedErrors ??= new Map()).set(node, {
    external,
    validation,
    errors,
  });
  return errors;
};
