import { isArray } from './isArray';

export const isEmptyArray = (value: unknown): value is any[] =>
  isArray(value) && value.length === 0;
