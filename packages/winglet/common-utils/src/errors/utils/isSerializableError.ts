import type { Fn } from '@aileron/declare';

import { ERROR_TAG } from '../../constant';
import { getTypeTag } from '../../libs';

type ErrorObject = ErrorConstructor & { isError?: Fn<[unknown], boolean> };

/**
 * Recognizes native errors across realms without trusting a custom type tag.
 * @param value - Metadata object to inspect; proxy trap exceptions propagate.
 * @returns Whether diagnostics should be projected. Older engines cannot identify
 * foreign errors with custom Symbol.toStringTag values without Error.isError.
 */
export const isSerializableError = (value: object): value is Error => {
  const isError = (Error as ErrorObject).isError;
  if (typeof isError === 'function') return isError(value);
  return (
    value instanceof Error ||
    (!(Symbol.toStringTag in value) && getTypeTag(value) === ERROR_TAG)
  );
};
