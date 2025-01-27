import { isBlob } from './isBlob';

export const isFile = (value: unknown): value is File => {
  if (File === undefined) return false;
  return isBlob(value) && value instanceof File;
};
