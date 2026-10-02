import type { FormErrorRecord, FormErrorReporter } from '@/schema-form/errors';

/** Mutable instance service retained outside the root boundary. */
export interface FormErrorService extends FormErrorReporter {
  /** Latest committed consumer of form records. */
  onError?: (record: FormErrorRecord) => void;
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
