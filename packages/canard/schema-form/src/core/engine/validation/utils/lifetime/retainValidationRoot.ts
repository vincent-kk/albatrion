import type { BlueprintSchema } from '../../../blueprint';
import type { Validator } from '../../types/validator';
import { recentReleaseList } from './recentReleaseList';

/**
 * Retain a committed tree's authored root under its selected validator.
 * @param validator - Instance used to compile this root.
 * @param authoredRoot - Original root object kept by the tree.
 * @returns Nothing; retention never compiles. The first readValidationEntry
 * prepares the entry, while a recently released root keeps its registration.
 */
export const retainValidationRoot = (
  validator: Validator,
  authoredRoot: BlueprintSchema,
): void => {
  const list = recentReleaseList(validator);
  const index = list.recent.indexOf(authoredRoot);
  if (index >= 0) list.recent.splice(index, 1);
  list.counts.set(authoredRoot, (list.counts.get(authoredRoot) ?? 0) + 1);
};
