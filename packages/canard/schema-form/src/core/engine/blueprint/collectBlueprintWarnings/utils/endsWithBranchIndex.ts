import { readPointerSegment } from '@/schema-form/helpers/jsonPointer';

/** Branch positions are plain decimal array indexes. */
const BRANCH_INDEX = /^\d+$/;

/**
 * Tell whether a schema path ends in one of the given keywords followed by a branch index.
 * @param schemaPath - Authored schema location of a declaration; an absolute extended pointer.
 * @param keywords - Branch-list keywords to accept, such as `allOf`.
 * @returns True when the second-to-last segment is one of the keywords and the last segment is a decimal index.
 */
export const endsWithBranchIndex = (
  schemaPath: string,
  keywords: readonly string[],
): boolean => {
  const keyword = readPointerSegment(schemaPath, -2);
  const index = readPointerSegment(schemaPath, -1);
  return (
    typeof keyword === 'string' &&
    keywords.includes(keyword) &&
    typeof index === 'string' &&
    BRANCH_INDEX.test(index)
  );
};
