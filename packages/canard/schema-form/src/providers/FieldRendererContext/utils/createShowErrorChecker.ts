import { type FieldNode, FieldNodeState } from '@/schema-form/core';
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
        : ShowError.EditedTouched;
  return (condition?: FieldNode['state']): boolean => {
    if (condition?.[FieldNodeState.ErrorVisible] !== undefined)
      return condition[FieldNodeState.ErrorVisible];
    if (flags & ShowError.Always) return true;
    if (flags & ShowError.Never) return false;
    if (flags & ShowError.Edited && condition?.[FieldNodeState.Edited])
      return true;
    if (flags & ShowError.Touched && condition?.[FieldNodeState.Touched])
      return true;
    return !!(
      flags & ShowError.EditedTouched &&
      condition?.[FieldNodeState.Edited] &&
      condition?.[FieldNodeState.Touched]
    );
  };
};
