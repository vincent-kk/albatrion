import type { BlueprintSchema } from '../../../blueprint';
import type { Validator } from '../../type';
import { readValidationEntry } from '../cache/readValidationEntry';
import { recentReleaseList } from './recentReleaseList';

/**
 * Retain a committed tree's authored root under its selected validator.
 * @param validator - Instance used to compile this root.
 * @param authoredRoot - Original root object kept by the tree.
 * @returns Nothing; a recently released root keeps its compiled registration.
 */
export const retainValidationRoot = (validator: Validator,
  authoredRoot: BlueprintSchema): void => {
  readValidationEntry(validator, authoredRoot);
  const list = recentReleaseList(validator);
  const index = list.recent.indexOf(authoredRoot);
  if (index >= 0) list.recent.splice(index, 1);
  list.counts.set(authoredRoot, (list.counts.get(authoredRoot) ?? 0) + 1);
};
