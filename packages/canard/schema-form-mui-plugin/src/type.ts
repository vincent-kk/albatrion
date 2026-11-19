import type { ReactNode } from 'react';

export type MuiContext = {
  /** Boolean switch state labels; takes priority over FieldInputProps.alias. */
  checkboxLabels?: { checked?: ReactNode; unchecked?: ReactNode };
  /** String switch labels keyed by stored enum value; takes priority over FieldInputProps.alias. */
  switchLabels?: { [value: string]: ReactNode };
  /** MUI size */
  size?: 'small' | 'medium';
  /** MUI variant */
  variant?: 'outlined' | 'filled' | 'standard';
  /** MUI fullWidth */
  fullWidth?: boolean;
};
