import { isPlainObject } from './isPlainObject';

export const isEmptyPlainObject = (value: unknown): value is object => {
  if (!isPlainObject(value)) return false;
  for (const _ in value) return false;
  return true;
};
