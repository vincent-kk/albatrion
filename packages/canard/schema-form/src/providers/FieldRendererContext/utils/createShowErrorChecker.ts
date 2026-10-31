import type { FieldNode } from '@/schema-form/core';
import { ShowError } from '@/schema-form/types';

/** Build the existing state-first display condition from an already resolved policy.
 * @param policy - Form/external/default policy; the engine deliberately stores it opaquely.
 * @returns A pure condition that preserves explicit ErrorVisible priority. */
export const createShowErrorChecker = (policy: unknown) => {
  const flags =
    typeof policy === 'boolean'
      ? policy
        ? ShowError.Always
        : ShowError.Never
      : typeof policy === 'number'
        ? policy
        : ShowError.DirtyTouched;
  return (condition?: FieldNode['state']): boolean => {
    if (condition?.[4] !== undefined) return condition[4];
    if (flags & ShowError.Always) return true;
    if (flags & ShowError.Never) return false;
    if (flags & ShowError.Dirty && condition?.[1]) return true;
    if (flags & ShowError.Touched && condition?.[2]) return true;
    return !!(
      flags & ShowError.DirtyTouched &&
      condition?.[1] &&
      condition?.[2]
    );
  };
};
