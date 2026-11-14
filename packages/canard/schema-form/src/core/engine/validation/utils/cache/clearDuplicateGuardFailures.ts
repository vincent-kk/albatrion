import type { ValidationEntry } from '../../types/validationEntry';
import { DUPLICATE_SCHEMA_ID_MESSAGE } from './constants';

/** Remove recoverable guard registration failures after whole-schema compilation succeeds.
 * @param entry - Shared cache whose successful guards and unrelated failures must stay intact.
 * @returns Nothing; deletes only guard failures matching the duplicate-id compiler message. */
export const clearDuplicateGuardFailures = (entry: ValidationEntry): void => {
  for (const [pointer, result] of entry.guards)
    if (
      result.failure instanceof Error &&
      DUPLICATE_SCHEMA_ID_MESSAGE.test(result.failure.message)
    )
      entry.guards.delete(pointer);
};
