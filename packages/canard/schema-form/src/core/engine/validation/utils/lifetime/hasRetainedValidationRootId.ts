import type { BlueprintSchema } from '../../../blueprint';
import type { Validator } from '../../types/validator';
import { recentReleaseList } from './recentReleaseList';

/** Check whether another counted root currently owns the same string id.
 * @param validator - Selected instance whose retained roots share registrations.
 * @param authoredRoot - Root being compiled; a non-string id never collides here.
 * @returns Whether a different live root has the same id. */
export const hasRetainedValidationRootId = (
  validator: Validator,
  authoredRoot: BlueprintSchema,
): boolean => {
  if (
    typeof authoredRoot !== 'object' ||
    authoredRoot === null ||
    typeof authoredRoot.$id !== 'string'
  )
    return false;
  for (const [other, count] of recentReleaseList(validator).counts)
    if (
      other !== authoredRoot &&
      count > 0 &&
      typeof other === 'object' &&
      other !== null &&
      other.$id === authoredRoot.$id
    )
      return true;
  return false;
};
