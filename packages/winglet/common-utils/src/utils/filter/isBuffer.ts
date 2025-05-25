const Buffer = globalThis.Buffer;

/**
 * Checks if a value is a Node.js Buffer.
 * In browser environments where the global Buffer object is not defined,
 * this function always returns false.
 *
 * @param value Value to check
 * @returns true if the value is a Node.js Buffer, false otherwise
 */
export const isBuffer = (value: unknown): value is Buffer =>
  Buffer !== undefined && Buffer.isBuffer(value);
