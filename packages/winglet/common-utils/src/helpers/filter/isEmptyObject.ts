import { isPlainObject } from './isPlainObject';

export const isEmptyObject = (value: unknown): value is object => {
  if (!isPlainObject(value)) return false;
  for (const _ in value) return false;
  return true;
};
