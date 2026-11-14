import type { Optional } from '@aileron/declare';

import type { FormErrorOrigin } from '@/schema-form/errors';

import {
  FormErrorCode,
  JSONSchemaError,
  SchemaFormError,
} from '../../../../../errors';
import type { PendingFormErrorRecord } from '../../../../../errors';
import type { FieldNodeRuntime } from '../../../record';
import { createFormErrorRecord } from './createFormErrorRecord';
import { readFormErrorCode } from './readFormErrorCode';

/**
 * Collect occurrences in order, merging matching failures into stored records.
 * @param pending - Records to extend or update before delivery
 * @param occurrences - Recorded and thrown occurrences collected by the chain
 * @param origin - Operation owning unlabelled failures in this collection
 * @param reported - Guard schema paths already recorded by this form instance
 * @returns Nothing; updates pending records in place
 */
export const collectChainRecords = (
  pending: PendingFormErrorRecord[],
  occurrences: NonNullable<FieldNodeRuntime<unknown>['chainOccurrences']>,
  origin: FormErrorOrigin,
  reported: Optional<ReadonlySet<string>>,
): void => {
  const created = new Set<PendingFormErrorRecord>();
  const merged = new Set<PendingFormErrorRecord>();
  for (const occurrence of occurrences) {
    if (occurrence.kind === 'record') {
      pending.push(occurrence.record);
      continue;
    }
    const error = occurrence.error;
    const existing = pending.find(
      (record) =>
        !created.has(record) &&
        record.level === 'error' &&
        record.code === readFormErrorCode(error) &&
        error instanceof SchemaFormError &&
        record.schemaPath === error.details.schemaPath,
    );
    if (existing && error instanceof SchemaFormError) {
      if (!merged.has(existing)) {
        existing.error = error;
        existing.details = error.details;
        merged.add(existing);
      }
      existing.origin ??= origin;
      continue;
    }
    if (
      error instanceof SchemaFormError &&
      readFormErrorCode(error) === FormErrorCode.GuardFailed &&
      typeof error.details.schemaPath === 'string' &&
      reported?.has(error.details.schemaPath)
    )
      continue;
    const record = createFormErrorRecord(
      true,
      readFormErrorCode(error),
      'error',
      () => (error instanceof Error ? error.message : String(error)),
      {
        error,
        ...(error instanceof SchemaFormError || error instanceof JSONSchemaError
          ? { details: error.details }
          : {}),
        ...(error instanceof SchemaFormError &&
        typeof error.details.path === 'string'
          ? { path: error.details.path }
          : {}),
        ...(error instanceof SchemaFormError &&
        typeof error.details.schemaPath === 'string'
          ? { schemaPath: error.details.schemaPath }
          : {}),
        origin,
      },
    );
    if (record) {
      pending.push(record);
      created.add(record);
    }
  }
};
