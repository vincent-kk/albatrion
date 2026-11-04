import { FormHelperText } from '@mui/material';

import type { FieldRendererProps } from '@canard/schema-form';

export const FormError = ({ errorMessage }: FieldRendererProps) => (
  <FormHelperText error>{errorMessage}</FormHelperText>
);
