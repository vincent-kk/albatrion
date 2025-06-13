import { isArrayIndex } from '@winglet/common-utils/filter';

/**
 * Converts JSON Pointer format to AJV dataPath format.
 *
 * @param jsonPointer - JSON Pointer string to convert (e.g., "/data/users/0/name")
 * @returns AJV dataPath format string (e.g., ".data.users[0].name")
 *
 * @example
 * ```ts
 * convertJsonPointerToPath('/data/users/0/name') // '.data.users[0].name'
 * convertJsonPointerToPath('/items/-/id')        // '.items[].id'
 * convertJsonPointerToPath('/0/value')           // '.[0].value'
 * convertJsonPointerToPath('/')                  // '.'
 * ```
 */
export const convertJsonPointerToPath = (jsonPointer: string): string => {
  // Handle empty input or root pointer
  if (!jsonPointer || jsonPointer === JSON_POINTER_SEPARATOR)
    return JSON_PATH_SEPARATOR;

  if (
    jsonPointer[0] === '.' ||
    ((jsonPointer[0] === '@' || jsonPointer[0] === '$') &&
      jsonPointer[1] === '.')
  )
    return jsonPointer;

  const length = jsonPointer.length;
  let result = JSON_PATH_SEPARATOR; // Always start with '.'
  let start = 1; // Start after initial '/'
  let index = 1; // Current parsing position (skip initial '/')
  let isFirstSegment = true; // Track if this is the first segment

  // Parse each character in the jsonPointer
  while (index < length) {
    const character = jsonPointer[index];
    // Handle segment separator '/'
    if (character === JSON_POINTER_SEPARATOR) {
      // Add current segment if exists
      if (index > start) {
        const segment = jsonPointer.slice(start, index);
        result += formatSegment(segment, isFirstSegment);
        isFirstSegment = false;
      }
      start = index + 1; // Move start past the separator
      index++;
    }
    // Regular character - continue parsing
    else index++;
  }

  // Add any remaining segment
  if (start < length) {
    const segment = jsonPointer.slice(start);
    result += formatSegment(segment, isFirstSegment);
  }

  return result;
};

/**
 * Formats a segment for JSON Path based on whether it's numeric (array index) or not.
 *
 * @param segment - The segment to format
 * @param isFirstSegment - Whether this is the first segment in the path
 * @returns Formatted segment for JSON Path
 */
const formatSegment = (segment: string, isFirstSegment: boolean): string => {
  // Handle special case: '-' becomes empty array index '[]'
  if (segment === JSON_PATH_ARRAY_INDEX_NEW) return JSON_PATH_ARRAY_EMPTY_ARRAY;
  if (isArrayIndex(segment))
    return `${JSON_PATH_ARRAY_INDEX_PREFIX}${segment}${JSON_PATH_ARRAY_INDEX_SUFFIX}`;
  else {
    // Property name: check if it contains dots and needs escaping
    if (segment.indexOf(JSON_PATH_SEPARATOR) === -1)
      // Regular property name: use dot notation (except for first segment)
      return isFirstSegment ? segment : `${JSON_PATH_SEPARATOR}${segment}`;
    else
      // Escape property names containing dots by wrapping in brackets
      return `${JSON_PATH_ARRAY_INDEX_PREFIX}${segment}${JSON_PATH_ARRAY_INDEX_SUFFIX}`;
  }
};

// JSON Path constants
const JSON_PATH_SEPARATOR = '.';
const JSON_PATH_ARRAY_INDEX_PREFIX = '[';
const JSON_PATH_ARRAY_INDEX_SUFFIX = ']';
const JSON_PATH_ARRAY_EMPTY_ARRAY = '[]';

// JSON Pointer constants
const JSON_POINTER_SEPARATOR = '/';
const JSON_PATH_ARRAY_INDEX_NEW = '-';
