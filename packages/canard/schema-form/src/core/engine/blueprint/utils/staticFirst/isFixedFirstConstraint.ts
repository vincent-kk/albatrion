import { isFixedFirstRecord } from './isFixedFirstRecord';

/**
 * Recognize only own finite length bounds with no output or shape semantics.
 * @param value - Authored overlay on an already unconditional string child
 * @returns Whether every key is a well-formed minLength or maxLength bound
 */
export const isFixedFirstConstraint = (value: unknown): boolean => {
  if (!isFixedFirstRecord(value)) return false;
  const record = value;
  for (const key of Object.keys(record)) {
    const bound = record[key];
    if (
      (key !== 'minLength' && key !== 'maxLength') ||
      typeof bound !== 'number' ||
      !Number.isInteger(bound) ||
      bound < 0
    )
      return false;
  }
  return true;
};
