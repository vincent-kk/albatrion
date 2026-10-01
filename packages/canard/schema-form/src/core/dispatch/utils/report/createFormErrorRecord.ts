import { FORM_ERROR_CODE_TABLE, JSONSchemaError } from '../../../../errors';
import type { FormErrorCode, FormErrorRecord } from '../../../../errors';
import type { BlueprintDiagnostic } from '../../../blueprint';

/**
 * Format one observed occurrence only when a consumer is present.
 * @param consumed - Whether this event can reach a reporter
 * @param code - Full ledger code for the occurrence
 * @param level - Error or warning severity
 * @param format - Deferred message formatter
 * @param fields - Optional location, details, original error and exposure path
 * @returns The formatted record, or no allocation without a consumer
 */
export function createFormErrorRecord(
  consumed: boolean, code: FormErrorCode,
  level: FormErrorRecord['level'], format: () => string,
  fields?: Partial<Omit<FormErrorRecord, 'code' | 'level' | 'message'>>,
): FormErrorRecord | undefined;
/**
 * Convert PR-1 diagnostic data into the same record shape after collection.
 * @param consumed - Whether the analyzed event has a consumer
 * @param diagnostic - Collector's authored error or warning data
 * @param error - Original static failure, if analysis threw one
 * @returns One record with the original error and details reference
 */
export function createFormErrorRecord(
  consumed: boolean, diagnostic: BlueprintDiagnostic, error?: unknown,
): FormErrorRecord | undefined;
export function createFormErrorRecord(
  consumed: boolean, code: FormErrorCode | BlueprintDiagnostic,
  levelOrError?: FormErrorRecord['level'] | unknown,
  format?: () => string,
  fields?: Partial<Omit<FormErrorRecord, 'code' | 'level' | 'message'>>,
): FormErrorRecord | undefined {
  if (!consumed) return undefined;
  if (typeof code === 'string') {
    if ((levelOrError !== 'error' && levelOrError !== 'warning') || !format)
      return undefined;
    return { level: levelOrError, code, message: format(), ...fields };
  }
  const fullCode = FORM_ERROR_CODE_TABLE.find(([candidate]) => candidate ===
    `${code.level === 'error' ? 'JSON_SCHEMA_ERROR' : 'SCHEMA_FORM_WARNING'}.${code.code}`)?.[0];
  if (!fullCode) return undefined;
  const error = levelOrError;
  const message = error instanceof Error ? error.message :
    `${code.code} at ${code.schemaPath}`;
  const details = error instanceof JSONSchemaError ? error.details :
    { ...code.details };
  if (code.level === 'error')
    return { level: 'error', code: fullCode, message,
      schemaPath: code.schemaPath, details, error, surface: 'sink' };
  return { level: 'warning', code: fullCode, message,
    schemaPath: code.schemaPath, details };
}
