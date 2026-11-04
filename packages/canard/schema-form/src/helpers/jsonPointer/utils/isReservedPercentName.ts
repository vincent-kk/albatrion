/**
 * Tell whether a property name equals one of the four reserved percent spellings.
 * @param name - Decoded property name as authored in a schema's `properties`.
 * @returns True for exactly `%2A`, `%2E`, `%2E%2E` or `%40`. Such a name formats to itself, but reading that path back yields the operator name (`*`, `.`, `..`, `@`), so the property cannot be addressed.
 */
export const isReservedPercentName = (name: string): boolean =>
  name.charCodeAt(0) === 37 &&
  (name === '%2A' || name === '%2E' || name === '%2E%2E' || name === '%40');
