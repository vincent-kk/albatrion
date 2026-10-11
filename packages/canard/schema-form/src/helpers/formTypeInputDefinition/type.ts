import type { ComponentType } from 'react';

import type {
  FormTypeInputProps,
  FormTypeTestFn,
} from '@/schema-form/types';

/** Private binding props; the applied Refresh generation never reaches user input props. */
export interface FormTypeInputBindingProps extends FormTypeInputProps {
  /** Input-only key after composition and mounted-child generation holds. */
  inputGeneration: number;
}

/** Resolved input and matching predicate used only by schema-form's selection layer. */
export interface NormalizedFormTypeInputDefinition {
  /** Input boundary created once by the owning resolver. */
  Component: ComponentType<FormTypeInputBindingProps>;
  /** Predicate applied to the effective schema's input hint. */
  test: FormTypeTestFn;
}
