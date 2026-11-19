import type { ReactNode } from 'react';

export type MuiContext = {
  /** Boolean switch state labels; takes priority over FieldInputProps.alias. */
  checkboxLabels?: { checked?: ReactNode; unchecked?: ReactNode };
  /** MUI size */
  size?: 'small' | 'medium';
  /** MUI variant */
  variant?: 'outlined' | 'filled' | 'standard';
  /** MUI fullWidth */
  fullWidth?: boolean;
};
