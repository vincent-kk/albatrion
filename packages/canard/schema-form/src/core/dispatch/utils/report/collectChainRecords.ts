import { JSONSchemaError, SchemaFormError } from '../../../../errors';
import type { FormErrorRecord } from '../../../../errors';
import type { SchemaNodeRuntime } from '../../../record';
import { createFormErrorRecord } from './createFormErrorRecord';
import { readFormErrorCode } from './readFormErrorCode';

/**
 * Collect occurrences in order, merging matching failures into stored records.
 * @param pending - Records to extend or update before delivery
 * @param occurrences - Recorded and thrown occurrences collected by the chain
 * @param aggregate - Bundled failure attached when the chain has several errors
 * @param surface - Final delivery surface owned by the enclosing collector
 * @returns Nothing; updates pending records in place
 */
export const collectChainRecords = (
  pending: FormErrorRecord[],
  occurrences: NonNullable<SchemaNodeRuntime<unknown>['chainOccurrences']>,
  aggregate: SchemaFormError | undefined,
  surface: 'thrown' | 'sink',
): void => {
  for (const occurrence of occurrences) {
    if (occurrence.kind === 'record') {
      pending.push(occurrence.record);
      continue;
    }
    const error = occurrence.error;
    const existing = pending.find((record) =>
      record.level === 'error' && record.code === readFormErrorCode(error) &&
      error instanceof SchemaFormError &&
      record.schemaPath === error.details.schemaPath);
    if (existing && error instanceof SchemaFormError) {
      existing.error = error;
      existing.details = error.details;
      existing.surface = surface;
      if (aggregate) existing.aggregate = aggregate;
      continue;
    }
    const record = createFormErrorRecord(true, readFormErrorCode(error), 'error',
      () => error instanceof Error ? error.message : String(error),
      { error, ...(error instanceof SchemaFormError ||
        error instanceof JSONSchemaError ? { details: error.details } : {}),
        ...(aggregate ? { aggregate } : {}), surface });
    if (record) pending.push(record);
  }
};
