import type { OmitPartial, Optional } from '@aileron/declare';

import {
  JSONSchemaError,
  isFormErrorCode,
  isFormWarningCode,
} from '../../../../../errors';
import type { FormErrorRecord, FormRecordCode } from '../../../../../errors';
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
  consumed: boolean,
  code: FormRecordCode,
  level: FormErrorRecord['level'],
  format: () => string,
  fields?: OmitPartial<FormErrorRecord, 'code' | 'level' | 'message'>,
): Optional<FormErrorRecord>;
/**
 * Convert PR-1 diagnostic data into the same record shape after collection.
 * @param consumed - Whether the analyzed event has a consumer
 * @param diagnostic - Collector's authored error or warning data
 * @param error - Original static failure, if analysis threw one
 * @returns One record with the original error and details reference
 */
export function createFormErrorRecord(
  consumed: boolean,
  diagnostic: BlueprintDiagnostic,
  error?: unknown,
): Optional<FormErrorRecord>;
export function createFormErrorRecord(
  consumed: boolean,
  code: FormRecordCode | BlueprintDiagnostic,
  levelOrError?: FormErrorRecord['level'] | unknown,
  format?: () => string,
  fields?: OmitPartial<FormErrorRecord, 'code' | 'level' | 'message'>,
): Optional<FormErrorRecord> {
  if (!consumed) return undefined;
  if (typeof code === 'string') {
    if ((levelOrError !== 'error' && levelOrError !== 'warning') || !format)
      return undefined;
    return { level: levelOrError, code, message: format(), ...fields };
  }
  const known =
    code.level === 'error'
      ? isFormErrorCode(code.code)
      : isFormWarningCode(code.code);
  if (!known) return undefined;
  const error = levelOrError;
  const message =
    error instanceof Error
      ? error.message
      : code.code.slice(code.code.indexOf('.') + 1) + ' at ' + code.schemaPath;
  const details =
    error instanceof JSONSchemaError ? error.details : { ...code.details };
  if (code.level === 'error')
    return {
      level: 'error',
      code: code.code,
      message,
      schemaPath: code.schemaPath,
      details,
      error,
      surface: 'sink',
    };
  return {
    level: 'warning',
    code: code.code,
    message,
    schemaPath: code.schemaPath,
    details,
  };
}
