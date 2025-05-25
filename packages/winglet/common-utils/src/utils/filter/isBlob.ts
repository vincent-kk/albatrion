const Blob = globalThis.Blob;

/**
 * Checks if a value is a Blob object.
 * In environments where the Blob API is not defined (e.g., older Node.js versions),
 * this function always returns false.
 *
 * @param value Value to check
 * @returns true if the value is a Blob object, false otherwise
 */
export const isBlob = (value: unknown): value is Blob =>
  // Check if the Blob constructor exists and
  // verify if the value is an instance of Blob.
  Blob !== undefined && value instanceof Blob;
