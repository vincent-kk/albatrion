import { hasOwnProperty } from './hasOwnProperty';

/**
 * Function to return the keys (indices or property names) of an object or array as an array
 * Works with arrays, objects, and other value types
 * @template Value - Type of the value to extract keys from
 * @param value - Value to extract keys from
 * @returns Array of keys extracted from the value
 */
export const getKeys = <Value>(value: Value) => {
  // For arrays, return indices as strings
  if (Array.isArray(value)) {
    const keys = new Array<string>(value.length);
    for (let i = 0; i < keys.length; i++) keys[i] = '' + i;
    return keys;
  }
  if (value && typeof value === 'object') return Object.keys(value);
  const keys: string[] = [];
  for (const key in value)
    if (hasOwnProperty(value, key)) keys[keys.length] = key;
  return keys;
};
