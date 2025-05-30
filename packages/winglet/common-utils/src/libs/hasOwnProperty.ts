const __hasOwnProperty__ = Object.prototype.hasOwnProperty;

/**
 * Function to check if an object directly owns a property
 * Returns true only for directly defined properties, not inherited ones
 * @template Value - Type of the target value
 * @param value - Object or value to check
 * @param key - Property key to check
 * @returns Whether the object directly owns the property
 */
export const hasOwnProperty = (
  value: unknown,
  key: PropertyKey,
): key is keyof typeof value => __hasOwnProperty__.call(value, key);
