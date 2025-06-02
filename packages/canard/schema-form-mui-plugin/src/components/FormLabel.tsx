import { FormLabel as MuiFormLabel } from '@mui/material';

import type { FormTypeRendererProps } from '@canard/schema-form';

export const FormLabel = ({ name, path, required }: FormTypeRendererProps) => (
  <MuiFormLabel htmlFor={path} required={required}>
    {name}
  </MuiFormLabel>
);
