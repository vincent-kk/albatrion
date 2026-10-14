import { FormWarningCode } from './FormWarningCode';

/** Every warning code value, built once for membership checks. */
const CODES: ReadonlySet<string> = new Set(Object.values(FormWarningCode));

/**
 * Tell whether a value is one of the package's warning codes.
 * @param value - Any value, typically a code read from a thrown error or diagnostic
 * @returns True when the value is a `FormWarningCode` value
 */
export const isFormWarningCode = (value: unknown): value is FormWarningCode =>
  typeof value === 'string' && CODES.has(value);
