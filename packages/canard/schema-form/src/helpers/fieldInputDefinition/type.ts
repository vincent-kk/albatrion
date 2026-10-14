import type { ComponentType } from 'react';

import type { FieldInputProps, FieldInputTestFn } from '@/schema-form/types';

/** Private binding props; the applied Refresh generation never reaches user input props. */
export interface FieldInputBindingProps extends FieldInputProps {
  /** Input-only key after composition and mounted-child generation holds. */
  inputGeneration: number;
}

/** Resolved input and matching predicate used only by schema-form's selection layer. */
export interface NormalizedFieldInputDefinition {
  /** Input boundary created once by the owning resolver. */
  Component: ComponentType<FieldInputBindingProps>;
  /** Predicate applied to the effective schema's input hint. */
  test: FieldInputTestFn;
}
