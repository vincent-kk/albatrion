import { clone } from '@winglet/common-utils';

/**
 * Process a value by cloning it if it's an object and immutable is true.
 *
 * @param value - The value to process
 * @param immutable - Whether to clone the value if it's an object
 * @returns The processed value
 * @note undefined is converted to null
 */
export const processValue = <Value>(
  value: Value,
  immutable: boolean,
): Value => {
  if (value === undefined) return null as Value;
  return immutable && typeof value === 'object' ? clone(value) : value;
};
