/**
 * Function to check if a value is a plain data object
 * @param value - Value to check
 * @returns true if the value is a plain data object, false otherwise
 */
export const isPlainObject = <T extends Record<PropertyKey, any>>(
  value: unknown,
): value is T => {
  if (!value || typeof value !== 'object') return false;

  const proto = Object.getPrototypeOf(value) as typeof Object.prototype | null;
  const hasObjectPrototype =
    proto === null ||
    proto === Object.prototype ||
    Object.getPrototypeOf(proto) === null;
  if (!hasObjectPrototype) return false;

  return Object.prototype.toString.call(value) === '[object Object]';
};
