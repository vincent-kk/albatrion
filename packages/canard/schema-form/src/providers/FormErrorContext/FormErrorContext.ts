import { createContext } from 'react';

import type { FormErrorService } from './type';

/** Instance service is provided outside the form's root boundary. */
export const FormErrorContext = createContext<FormErrorService | undefined>(
  undefined,
);
