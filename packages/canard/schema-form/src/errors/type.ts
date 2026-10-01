import type { ErrorDetails } from '@winglet/common-utils/error';

import type { SchemaFormError } from './SchemaFormError';
import type { FORM_ERROR_CODE_TABLE } from './formErrorCode';

/** Full group-qualified code from the live error ledger table. */
export type FormErrorCode = (typeof FORM_ERROR_CODE_TABLE)[number][0];

/** Closed reason values for the ledger codes that define one. */
export type FormErrorReason<Code extends FormErrorCode> =
  Code extends
    | 'SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED'
    | 'SCHEMA_FORM_ERROR.GUARD_FAILED'
    ? 'duplicateSchemaId'
    : Code extends 'SCHEMA_FORM_WARNING.TYPE_MISMATCH'
      ? 'unconvertible' | 'ambiguous'
      : Code extends 'JSON_SCHEMA_ERROR.DISCRIMINATOR_MISMATCH'
        ? 'missing' | 'kind' | 'overlap' | 'key'
        : never;

/** Error details for a known code; unrelated codes have no reason field. */
export type FormErrorDetails<Code extends FormErrorCode> = ErrorDetails &
  ([FormErrorReason<Code>] extends [never]
    ? { reason?: never }
    : { reason?: FormErrorReason<Code> });

/** Observed form failure or warning; dispatch owns delivery and aggregation. */
export interface FormErrorRecord {
  /** Severity of this occurrence. */
  level: 'error' | 'warning';
  /** Full group-qualified code. */
  code: FormErrorCode;
  /** Message formatted once for the observer. */
  message: string;
  /** JSON Pointer to an affected data node, when owned by one. */
  path?: string;
  /** JSON Pointer to an authored schema location, when available. */
  schemaPath?: string;
  /** The same reference as error.details for domain errors. */
  details?: ErrorDetails;
  /** Value that will be exposed by this failure. */
  error?: unknown;
  /** Actual SchemaFormError thrown for an aggregate of several failures. */
  aggregate?: SchemaFormError;
  /** External exposure path for an error occurrence. */
  surface?: 'thrown' | 'rejected' | 'sink';
  /** React boundary stack, populated by the render layer. */
  componentStack?: string;
}

/** Core-facing observer whose absence avoids warning work. */
export interface FormErrorReporter {
  /**
   * Deliver an already formatted form occurrence.
   * @param record - One occurrence with its stable code, level, and surface.
   * @returns Nothing; the observer receives the occurrence.
   */
  report(record: FormErrorRecord): void;
  /**
   * Check whether an observer or development sink can consume occurrences.
   * @returns Whether producing a record can reach a consumer.
   */
  hasConsumer(): boolean;
}
