import type { ComponentType } from 'react';

import type { FieldInputProps, FieldInputTestFn } from '@/schema-form/types';

/** Private binding props; Refresh generation and selection lifetime never reach user inputs. */
export type FieldInputBindingProps = {
  [Key in keyof FieldInputProps as Key extends 'defaultValue'
    ? never
    : Key]: FieldInputProps[Key];
} & {
  /** Input-only key after composition and mounted-child generation holds. */
  inputGeneration: number;
  /** Committed selection lifetime, revoked before the raw input cleanup runs. */
  inputSelection: { active: boolean };
};

/** Resolved input and matching predicate used only by schema-form's selection layer. */
export interface NormalizedFieldInputDefinition {
  /** Input boundary created once by the owning resolver. */
  Component: ComponentType<FieldInputBindingProps>;
  /** Predicate applied to the effective schema's input hint. */
  test: FieldInputTestFn;
  /** The definition's value-reading declaration, kept only when it is a boolean. */
  controlled?: boolean;
}
