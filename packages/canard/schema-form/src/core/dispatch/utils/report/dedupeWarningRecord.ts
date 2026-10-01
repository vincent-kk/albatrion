import type { FormErrorCode, FormErrorRecord } from '../../../../errors';
import { createFormErrorRecord } from './createFormErrorRecord';

/**
 * Admit one structural warning per load before formatting its message.
 * @param keys - Per-tree warning identities
 * @param code - Full warning code
 * @param location - Data or schema pointer, empty for form level
 * @param discriminator - Code-specific field such as an allOf keyword
 * @param format - Message formatter called only for a new key
 * @param fields - Optional record location and details
 * @returns New warning record, or undefined for a duplicate
 */
export const dedupeWarningRecord = (
  keys: Set<string>, code: FormErrorCode, location: string,
  discriminator: unknown, format: () => string,
  fields?: Partial<Omit<FormErrorRecord, 'code' | 'level' | 'message'>>,
): FormErrorRecord | undefined => {
  const key = JSON.stringify([code, location, discriminator]);
  if (keys.has(key)) return undefined;
  keys.add(key);
  return createFormErrorRecord(true, code, 'warning', format, fields);
};
