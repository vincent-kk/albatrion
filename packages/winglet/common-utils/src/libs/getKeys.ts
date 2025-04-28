import { hasOwnProperty } from './hasOwnProperty';

export const getKeys = <Value>(value: Value) => {
  if (Array.isArray(value)) {
    const keys = new Array(value.length);
    for (let k = 0; k < keys.length; k++) keys[k] = '' + k;
    return keys;
  }
  if (value && typeof value === 'object') return Object.keys(value);
  const keys = [];
  for (let i in value) if (hasOwnProperty(value, i)) keys.push(i);
  return keys;
};
