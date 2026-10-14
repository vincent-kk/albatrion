import { FormErrorCode } from './FormErrorCode';

/** Every error code value, built once for membership checks. */
const CODES: ReadonlySet<string> = new Set(Object.values(FormErrorCode));

/**
 * Tell whether a value is one of the package's error codes.
 * @param value - Any value, typically a code read from a thrown error or diagnostic
 * @returns True when the value is a `FormErrorCode` value
 */
export const isFormErrorCode = (value: unknown): value is FormErrorCode =>
  typeof value === 'string' && CODES.has(value);
