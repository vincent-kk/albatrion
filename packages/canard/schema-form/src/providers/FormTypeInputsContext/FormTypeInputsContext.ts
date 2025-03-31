import { createContext } from 'react';

import type { NormalizedFormTypeInputDefinition } from '@/schema-form/helpers/formTypeInputDefinition';

export interface FormTypeInputsContext {
  fromFormTypeInputDefinitions: NormalizedFormTypeInputDefinition[];
  fromFormTypeInputMap: NormalizedFormTypeInputDefinition[];
}

export const FormTypeInputsContext = createContext<FormTypeInputsContext>(
  {} as FormTypeInputsContext,
);
