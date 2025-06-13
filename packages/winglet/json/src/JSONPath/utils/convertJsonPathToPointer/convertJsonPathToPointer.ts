/**
 * Converts AJV dataPath format to JSONPointer format.
 *
 * @param dataPath - AJV dataPath string to convert (e.g., "data.users[0].name")
 * @returns JSONPointer format string (e.g., "/data/users/0/name")
 *
 * @example
 * ```ts
 * convertJsonPathToPointer('data.users[0].name') // '/data/users/0/name'
 * convertJsonPathToPointer('items[].id')         // '/items/-/id'
 * convertJsonPathToPointer('[0].value')          // '/0/value'
 * convertJsonPathToPointer('')                   // '/'
 * ```
 */
export const convertJsonPathToPointer = (dataPath: string): string => {
  // Handle empty input - return root pointer
  if (!dataPath) return JSON_POINTER_SEPARATOR;

  const length = dataPath.length;
  let result = '';
  let start = 0; // Start position of current segment
  let index = 0; // Current parsing position

  // Parse each character in the dataPath
  while (index < length) {
    const character = dataPath[index];

    // Handle property separator '.'
    if (character === JSON_PATH_SEPARATOR) {
      // Add current segment if exists
      if (index > start)
        result += JSON_POINTER_SEPARATOR + dataPath.slice(start, index);
      start = index + 1; // Move start past the separator
      index++;
    }
    // Handle array index start '['
    else if (character === JSON_PATH_ARRAY_INDEX_PREFIX) {
      // Add current segment if exists
      if (index > start)
        result += JSON_POINTER_SEPARATOR + dataPath.slice(start, index);

      // Find the closing bracket and extract array index
      const openIndex = ++index; // Position after '['
      while (index < length && dataPath[index] !== JSON_PATH_ARRAY_INDEX_SUFFIX)
        index++;

      // Extract array index content between brackets
      const arrayContent = dataPath.slice(openIndex, index);
      // Empty array index '[]' becomes '-' per JSON Pointer standard
      result +=
        JSON_POINTER_SEPARATOR +
        (arrayContent === '' ? JSON_PATH_ARRAY_INDEX_NEW : arrayContent);

      // Skip closing bracket ']' if present
      if (index < length) index++;
      start = index; // Reset start position
    }
    // Regular character - continue parsing
    else index++;
  }

  // Add any remaining segment
  if (start < length) result += JSON_POINTER_SEPARATOR + dataPath.slice(start);

  // Return result or root pointer if empty
  return result || JSON_POINTER_SEPARATOR;
};
const JSON_PATH_SEPARATOR = '.';
const JSON_PATH_ARRAY_INDEX_PREFIX = '[';
const JSON_PATH_ARRAY_INDEX_SUFFIX = ']';

const JSON_POINTER_SEPARATOR = '/';
const JSON_PATH_ARRAY_INDEX_NEW = '-';
