import { isObject } from './isObject';

export const isEmptyObject = (value: unknown): value is object => {
  if (!isObject(value)) return false;
  for (const _ in value) return false;
  return true;
};
