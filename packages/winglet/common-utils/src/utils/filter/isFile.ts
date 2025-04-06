import { isBlob } from './isBlob';

export const isFile = (value: unknown): value is File =>
  File !== undefined && isBlob(value) && value instanceof File;
