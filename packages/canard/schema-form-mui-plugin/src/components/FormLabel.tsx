import { FormLabel as MuiFormLabel } from '@mui/material';

import type { FieldRendererProps } from '@canard/schema-form';

export const FormLabel = ({ name, path, required }: FieldRendererProps) => (
  <MuiFormLabel htmlFor={path} required={required}>
    {name}
  </MuiFormLabel>
);
