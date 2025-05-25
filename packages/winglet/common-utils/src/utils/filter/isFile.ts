import { isBlob } from './isBlob';

const File = globalThis.File;

/**
 * Checks if a value is a File object.
 * In environments where the File API is not defined (e.g., older Node.js versions),
 * this function always returns false.
 *
 * @param value Value to check
 * @returns true if the value is a File object, false otherwise
 */
export const isFile = (value: unknown): value is File =>
  // Check if the File constructor exists, isBlob result is true, and
  // verify if the value is an instance of File.
  File !== undefined && isBlob(value) && value instanceof File;
