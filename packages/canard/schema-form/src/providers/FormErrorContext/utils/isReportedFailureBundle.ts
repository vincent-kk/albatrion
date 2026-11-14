import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';

/** Recognize dense, nonempty bundles whose leaves are already known objects.
 * @param errors - Candidate bundle contents.
 * @param seen - Errors already delivered to the consumer.
 * @param handlerFailures - Objects thrown by the consumer itself.
 * @returns Whether every level is known; malformed or revisited nested bundles are unknown. */
export const isReportedFailureBundle = (
  errors: unknown,
  seen: WeakSet<object>,
  handlerFailures: WeakSet<object>,
): boolean => {
  try {
    const lists: unknown[] = [errors];
    const visited = new Set<object>();
    let remaining = 1_000_000;
    while (lists.length) {
      const list = lists.pop();
      if (!isArray(list)) return false;
      const length = list.length;
      if (
        !Number.isInteger(length) ||
        length < 1 ||
        length > 0xffff_ffff ||
        length > remaining
      )
        return false;
      remaining -= length;
      for (let index = 0; index < length; index++) {
        if (!hasOwnProperty(list, index)) return false;
        const failure: unknown = list[index];
        if (failure === null || typeof failure !== 'object') return false;
        if (seen.has(failure) || handlerFailures.has(failure)) continue;
        if (
          !(failure instanceof SchemaFormError) ||
          failure.code !== FormErrorCode.MultipleErrors ||
          visited.has(failure)
        )
          return false;
        visited.add(failure);
        lists.push(failure.details?.errors);
      }
      if (list.length !== length) return false;
    }
    return true;
  } catch {
    return false;
  }
};
