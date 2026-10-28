import {
  PointerOperator,
  parsePointer,
} from '@/schema-form/helpers/jsonPointer';

/**
 * Recognize absolute input-map patterns containing a wildcard segment.
 * @param path - Authored map address; relative and trailing-empty paths are excluded.
 * @returns Whether the parsed path contains a wildcard operator.
 */
export const hasWildcardPath = (path: string): boolean => {
  const parsed = parsePointer(path);
  return (
    parsed.absolute &&
    parsed.segments[parsed.segments.length - 1] !== '' &&
    parsed.segments.includes(PointerOperator.Wildcard)
  );
};
