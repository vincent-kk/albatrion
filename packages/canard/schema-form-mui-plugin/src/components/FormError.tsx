import { FormHelperText } from '@mui/material';

import type { FormTypeRendererProps } from '@canard/schema-form';

export const FormError = ({ errorMessage }: FormTypeRendererProps) => (
  <FormHelperText error>{errorMessage}</FormHelperText>
);
