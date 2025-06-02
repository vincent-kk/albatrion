import type { ReactNode } from 'react';

import { FormHelperText } from '@mui/material';

import type { JsonSchemaError } from '@canard/schema-form';

export const formatError = (error: JsonSchemaError): ReactNode => {
  return <FormHelperText error>{error.message}</FormHelperText>;
};
