import type { FormErrorRecord, FormErrorReporter } from '@/schema-form/errors';
import type { SchemaNode } from '@/schema-form/core';

/** Mutable instance service retained outside the root boundary. */
export interface FormErrorService extends FormErrorReporter {
  /** Latest committed consumer of form records. */
  onError?: (record: FormErrorRecord) => void;
  /** Current load root retained for buffered and boundary observer scopes. */
  root?: SchemaNode;
  /** Start a load's warning lifetime without dropping error identities. */
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
