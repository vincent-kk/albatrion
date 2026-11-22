import type { ReactNode } from 'react';

export type MuiContext = {
  /** Boolean switch labels, taking precedence over the input alias. */
  checkboxLabels?: { checked?: ReactNode; unchecked?: ReactNode };
  /** String switch labels keyed by stored enum value, taking precedence over the input alias. */
  switchLabels?: { [value: string]: ReactNode };
  /** MUI size */
  size?: 'small' | 'medium';
  /** MUI variant */
  variant?: 'outlined' | 'filled' | 'standard';
  /** MUI fullWidth */
  fullWidth?: boolean;
};
