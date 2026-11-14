import { createContext } from 'react';

import type { Optional } from '@aileron/declare';

import type { FormErrorService } from '../type';

/** Instance service is provided outside the form's root boundary. */
export const FormErrorContext =
  createContext<Optional<FormErrorService>>(undefined);
