import {
  type PointerSegment,
  joinPointerWithPrefixOf,
} from '@/schema-form/helpers/jsonPointer';

/** Branch positions are plain decimal array indexes. */
const BRANCH_POSITION = /^\d+$/;

/** One `oneOf` branch a declaration's schema path runs through. */
interface OneOfBranch {
  /** Schema location of the `oneOf` array holding the branch. */
  readonly oneOfPath: string;
  /** Decimal position of the branch inside that array, as written in the path. */
  readonly position: string;
}

/**
 * Find the innermost `oneOf` branch that a declaration's schema path crosses.
 * @param schemaPath - Authored schema location of a declaration; an absolute extended pointer, with or without the leading `#`.
 * @param segments - Prepared decoded syntax for schemaPath, owned by its blueprint.
 * @returns The `oneOf` array location, written with the same leading `#` as the input, and the branch position; undefined when the path crosses no `oneOf` branch.
 */
export const readOneOfBranch = (
  schemaPath: string,
  segments: readonly PointerSegment[],
): OneOfBranch | undefined => {
  for (let index = segments.length - 2; index >= 0; index--) {
    const position = segments[index + 1];
    if (
      segments[index] === 'oneOf' &&
      typeof position === 'string' &&
      BRANCH_POSITION.test(position)
    )
      return {
        oneOfPath: joinPointerWithPrefixOf(
          schemaPath,
          segments.slice(0, index + 1),
        ),
        position,
      };
  }
  return undefined;
};
