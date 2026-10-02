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
  root?: SchemaNode;
  props: RootLoadProps;
  records: FormErrorRecord[];
  error?: unknown;
  ready: boolean;
  prepared: boolean;
  /** Records have crossed the commit or root-fallback boundary. */
  reported?: boolean;
  reporter?: FormErrorService;
}

/** Bridge exposing current root and reset to the Form handle. */
export interface RootBinding {
  root?: SchemaNode;
  reset: FormHandle['reset'];
}
