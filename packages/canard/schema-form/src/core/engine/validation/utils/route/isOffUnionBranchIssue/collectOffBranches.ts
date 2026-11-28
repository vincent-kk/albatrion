import {
  JSONPointer as $,
  isDescendantPath,
  readPointerSegment,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import type { SchemaFragment } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';

/** A decimal branch index as the last segment of a branch fragment location. */
const BRANCH_INDEX = /^\d+$/;

/**
 * Collect the union branches bound at one occurrence that are off: not committed there
 * while a sibling branch of the same union is.
 * @param host - Occurrence whose blueprint node declarations name the fragments bound there.
 * @param fragments - The blueprint's fragment table, indexed by fragment id.
 * @param isActive - Committed branch evidence for a fragment at a given host occurrence.
 * @returns The off branches, empty when the occurrence hosts no union with a committed branch.
 */
export const collectOffBranches = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  fragments: readonly SchemaFragment[],
  isActive: (fragment: SchemaFragment, host: Self) => boolean,
): SchemaFragment[] => {
  const branches: SchemaFragment[] = [];
  for (const declaration of host.blueprintNode.declarations) {
    const fragment = fragments[declaration.fragmentId];
    const index = readPointerSegment(fragment.schemaPath, -1);
    const keyword = readPointerSegment(fragment.schemaPath, -2);
    if (
      typeof index === 'string' &&
      BRANCH_INDEX.test(index) &&
      (keyword === 'oneOf' || keyword === 'anyOf') &&
      !branches.includes(fragment)
    )
      branches.push(fragment);
  }
  const off: SchemaFragment[] = [];
  for (const branch of branches) {
    if (isActive(branch, host)) continue;
    const union = resolvePointer(branch.schemaPath, $.Parent);
    if (
      branches.some(
        (sibling) =>
          sibling !== branch &&
          isDescendantPath(sibling.schemaPath, union) &&
          BRANCH_INDEX.test(sibling.schemaPath.slice(union.length + 1)) &&
          isActive(sibling, host),
      )
    )
      off.push(branch);
  }
  return off;
};
