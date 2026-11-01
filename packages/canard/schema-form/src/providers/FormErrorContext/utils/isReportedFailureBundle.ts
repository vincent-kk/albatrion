import { isArray } from '@winglet/common-utils/filter';

/** Recognize a nonempty dense bundle consisting only of previously reported objects.
 * @param errors - Candidate bundle contents.
 * @param seen - Errors already delivered to the consumer.
 * @param handlerFailures - Objects thrown by the consumer itself.
 * @returns Whether every index contains a known object, including no holes. */
export const isReportedFailureBundle = (
  errors: unknown,
  seen: WeakSet<object>,
  handlerFailures: WeakSet<object>,
): boolean => {
  if (!isArray(errors) || errors.length === 0) return false;
  for (let index = 0; index < errors.length; index++) {
    const failure: unknown = errors[index];
    if (
      failure === null ||
      typeof failure !== 'object' ||
      (!seen.has(failure) && !handlerFailures.has(failure))
    )
      return false;
  }
  return true;
};
