import {
  isAbsolutePointer,
  joinPointer,
  parsePointerSegments,
} from '@/schema-form/helpers/jsonPointer';
import type { FieldInputTestFn } from '@/schema-form/types';

/**
 * Prepare a text matcher without interpreting names as regular expressions.
 * @param inputPath - Authored key; only absolute pointers are canonicalized.
 * @returns A predicate comparing one canonical node path for equality.
 */
export const pathExactMatchFnFactory = (
  inputPath: string,
): FieldInputTestFn => {
  const path = isAbsolutePointer(inputPath)
    ? joinPointer(parsePointerSegments(inputPath))
    : inputPath;
  return (hint) => hint.path === path;
};
