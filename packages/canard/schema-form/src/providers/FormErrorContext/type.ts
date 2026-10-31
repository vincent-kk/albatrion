import type { FieldNode } from '@/schema-form/core';
import type {
  FormErrorRecord,
  FormErrorReporter,
  FormErrorSurface,
} from '@/schema-form/errors';

/** Mutable instance service retained outside the root boundary. */
export interface FormErrorService extends FormErrorReporter {
  /** Latest committed consumer of form records. */
  onError?: (record: FormErrorRecord) => void;
  /** Current load root retained for buffered and boundary observer scopes. */
  root?: FieldNode;
  /** Number of started loads; field read detectors compare it to report a first read once per load. */
  load: number;
  /** Private identity for warning deduplication within one original form-level load. */
  warningScope: object;
  /** Report a moved record in its original warning lifetime. */
  reportInLoad(record: FormErrorRecord, scope: object): void;
  /** Start a load's warning lifetime and advance `load` without dropping error identities. */
  beginLoad(): void;
  /** Drain speculative load errors if the root boundary abandons its children. */
  pendingLoad?: () => void;
  /** Report a caught error without rethrowing it. */
  capture(
    error: unknown,
    componentStack?: string,
    surface?: FormErrorSurface,
    path?: string,
  ): void;
}
