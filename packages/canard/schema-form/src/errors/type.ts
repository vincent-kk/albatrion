import type { ErrorDetails } from '@winglet/common-utils/error';

import type { SchemaFormError } from './classes/SchemaFormError';
import type { FormErrorCode } from './codes/FormErrorCode';
import type { FormWarningCode } from './codes/FormWarningCode';

/** Error codes a JSONSchemaError carries. */
export type JSONSchemaErrorCode = Extract<
  FormErrorCode,
  `JSON_SCHEMA_ERROR.${string}`
>;

/** Error codes a SchemaFormError carries. */
export type SchemaFormErrorCode = Extract<
  FormErrorCode,
  `SCHEMA_FORM_ERROR.${string}`
>;

/** Error codes an UnhandledError carries. */
export type UnhandledErrorCode = Extract<
  FormErrorCode,
  `UNHANDLED_ERROR.${string}`
>;

/** Error codes a ValidationError carries. */
export type ValidationErrorCode = Extract<
  FormErrorCode,
  `VALIDATION_ERROR.${string}`
>;

/** Every code a report record carries: an error or a warning code. */
export type FormRecordCode = FormErrorCode | FormWarningCode;

/** Closed reason values for the ledger codes that define one. */
export type FormErrorReason<Code extends FormRecordCode> = Code extends
  | typeof FormErrorCode.ValidatorCompileFailed
  | typeof FormErrorCode.GuardFailed
  ? 'duplicateSchemaId'
  : Code extends typeof FormWarningCode.TypeMismatch
    ? 'unconvertible' | 'ambiguous'
    : Code extends typeof FormErrorCode.DiscriminatorMismatch
      ? 'missing' | 'kind' | 'overlap' | 'key'
      : never;

/**
 * Code-specific details with closed reasons and automatic-write source paths.
 * Only injection-target and virtual-write-shape errors allow sourcePath;
 * caller-origin virtual-write-shape errors omit it.
 */
export type FormErrorDetails<Code extends FormRecordCode> = ErrorDetails &
  ([FormErrorReason<Code>] extends [never]
    ? { reason?: never }
    : { reason?: FormErrorReason<Code> }) &
  (Code extends
    | typeof FormErrorCode.InjectTargetMissing
    | typeof FormErrorCode.InvalidVirtualNodeValues
    ? { sourcePath?: string }
    : { sourcePath?: never });

/** Observed form failure or warning; dispatch owns delivery and aggregation. */
export interface FormErrorRecord {
  /** Severity of this occurrence. */
  level: 'error' | 'warning';
  /** Full group-qualified code. */
  code: FormRecordCode;
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
