import { createContext } from 'react';

import type { NormalizedFormTypeInputDefinition } from '@/schema-form/helpers/formTypeInputDefinition';

export interface FormTypeInputsContext {
  /** List of FormTypeInputDefinition declared externally */
  fromFormTypeInputDefinitions: NormalizedFormTypeInputDefinition[];
  /** Map of FormTypeInputDefinition declared externally */
  fromFormTypeInputMap: NormalizedFormTypeInputDefinition[];
}

export const FormTypeInputsContext = createContext<FormTypeInputsContext>(
  {} as FormTypeInputsContext,
);
