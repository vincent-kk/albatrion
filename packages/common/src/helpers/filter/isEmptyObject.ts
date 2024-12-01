import { isPlainObject } from './isPlainObject';

export const isEmptyObject = (value: unknown): value is object =>
  isPlainObject(value) && Object.keys(value).length === 0;
