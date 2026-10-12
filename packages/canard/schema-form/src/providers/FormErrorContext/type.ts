import type { SchemaNode } from '@/schema-form/core';
import type { FormErrorRecord, FormErrorReporter } from '@/schema-form/errors';

/** Mutable instance service retained outside the root boundary. */
export interface FormErrorService extends FormErrorReporter {
  /** Latest committed consumer of form records. */
  onError?: (record: FormErrorRecord) => void;
  /** Current load root retained for buffered and boundary observer scopes. */
  root?: SchemaNode;
  /** Number of started loads; field read detectors compare it to report a first read once per load. */
  load: number;
  /** Start a load's warning lifetime and advance `load` without dropping error identities. */
  beginLoad(): void;
  /** Drain speculative load errors if the root boundary abandons its children. */
  pendingLoad?: () => void;
  /** Report a caught error without rethrowing it. */
  capture(
    error: unknown,
    componentStack?: string,
    surface?: 'sink' | 'rejected' | 'thrown',
    path?: string,
  ): void;
}
