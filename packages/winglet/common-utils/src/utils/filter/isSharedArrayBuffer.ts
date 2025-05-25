const SharedArrayBuffer = globalThis.SharedArrayBuffer;

/**
 * Checks if a value is a SharedArrayBuffer object.
 * In environments where the SharedArrayBuffer API is not defined,
 * this function always returns false.
 *
 * @param value Value to check
 * @returns true if the value is a SharedArrayBuffer object, false otherwise
 */
export const isSharedArrayBuffer = (
  value: unknown,
): value is SharedArrayBuffer =>
  // Check if the SharedArrayBuffer constructor exists and
  // verify if the value is an instance of SharedArrayBuffer.
  SharedArrayBuffer !== undefined && value instanceof SharedArrayBuffer;
