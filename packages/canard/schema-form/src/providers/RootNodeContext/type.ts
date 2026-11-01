import type { FormHandle, FormProps } from '@/schema-form/components/Form';
import type { FieldNode, Validator } from '@/schema-form/core';
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
  root?: FieldNode;
  /** Props from the last connected commit; prepared current loads use these while hidden. */
  props: RootLoadProps;
  /** Reports raised before preparation, delivered once by the first commit, reset, or root fallback. */
  records: FormErrorRecord[];
  /** Original root and private warning load of a buffered or transferred record. */
  recordOrigins?: WeakMap<
    FormErrorRecord,
    { root?: FieldNode; warningScope?: object }
  >;
  /** Warning scope captured for direct records placed in this load. */
  warningScope?: object;
  /** Construction, mount, or reset failure kept for the reset caller or root boundary to throw and report. */
  error?: unknown;
  /** First commit ran; deliver every form callback while effects are disconnected, until reset retires this load. */
  prepared: boolean;
  /** Latest scheduled load slot, including same-root reset generations. */
  loadValidation?: object;
  /** A reset replaced this load; it delivers nothing more to the consumer. */
  retired?: boolean;
  /** Records or construction errors have crossed the commit, replacement reset, or root-fallback boundary. */
  reported?: boolean;
  /** Instance reporter outside the root boundary; absent when no Form error provider is mounted. */
  reporter?: FormErrorService;
}

/** Provider-owned load and reports retained across root replacements. */
export interface RootLoadStore {
  /** Current load exposed to the Form handle and React subscribers. */
  load: RootLoad;
  /** Last aggregate delivered to the consumer, absent before the first report. */
  lastReportedErrors?: FieldNode['globalErrors'];
  /** React subscribers notified when reset replaces the current load. */
  listeners: Set<() => void>;
  /** Release the active root's validation and diagnostics subscription. */
  unsubscribe: () => void;
}

/** Bridge exposing current root and reset to the Form handle. */
export interface RootBinding {
  /** Root of the committed load; undefined while no root could be built. */
  root?: FieldNode;
  /** Start a new load from the latest committed props, keeping the root when the schema is unchanged. */
  reset: FormHandle['reset'];
  /** Explicit cache invalidation and replacement through reset load semantics. */
  rebuild: FormHandle['rebuild'];
}
