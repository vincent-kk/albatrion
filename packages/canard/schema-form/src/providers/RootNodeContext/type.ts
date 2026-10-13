import type { FormHandle, FormProps } from '@/schema-form/components/Form';
import type { SchemaNode, Validator } from '@/schema-form/core';
import type { FormErrorRecord } from '@/schema-form/errors';

import type { FormErrorService } from '../FormErrorContext';

/** Current committed props used by a synchronous load. */
export type RootLoadProps = Pick<
  FormProps,
  | 'jsonSchema'
  | 'defaultValue'
  | 'errors'
  | 'validationMode'
  | 'onChange'
  | 'onValidate'
  | 'onStateChange'
  | 'onDiagnosticsChange'
  | 'context'
  | 'unsetOnInactive'
  | 'disableAutomaticWrites'
  | 'showError'
> & { validator?: Validator };

/** A committed or speculative root and its buffered load reports. */
export interface RootLoad {
  /** Built root; absent when construction threw or a shared-schema conflict discarded it. */
  root?: SchemaNode;
  /** Props this load was built from; change callbacks read them only while `ready`. */
  props: RootLoadProps;
  /** Reports raised before the first commit, delivered once by the commit or root fallback. */
  records: FormErrorRecord[];
  /** Construction or mount failure kept for the root boundary to throw and report. */
  error?: unknown;
  /** The load is committed: reports, changes and state notifications go to the host directly. */
  ready: boolean;
  /** The first commit's preparation (buffer flush, external errors, initial validation) has run. */
  prepared: boolean;
  /** Records have crossed the commit or root-fallback boundary. */
  reported?: boolean;
  /** Instance reporter outside the root boundary; absent when no Form error provider is mounted. */
  reporter?: FormErrorService;
}

/** Provider-owned load and reports retained across root replacements. */
export interface RootLoadStore {
  /** Current load exposed to the Form handle and React subscribers. */
  load: RootLoad;
  /** Last aggregate delivered to the consumer, absent before the first report. */
  lastReportedErrors?: SchemaNode['globalErrors'];
  /** React subscribers notified when reset replaces the current load. */
  listeners: Set<() => void>;
  /** Release the active root's validation and diagnostics subscription. */
  unsubscribe: () => void;
}

/** Bridge exposing current root and reset to the Form handle. */
export interface RootBinding {
  /** Root of the committed load; undefined while no root could be built. */
  root?: SchemaNode;
  /** Start a new load from the latest committed props, keeping the root when the schema is unchanged. */
  reset: FormHandle['reset'];
}
