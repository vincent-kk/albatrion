import { createContext } from 'react';

import type { NormalizedFormTypeInputDefinition } from '@/schema-form/helpers/formTypeInputDefinition';

export interface FormTypeInputsContextProps {
  fromFormTypeInputDefinitions: NormalizedFormTypeInputDefinition[];
  fromFormTypeInputMap: NormalizedFormTypeInputDefinition[];
}

export const FormTypeInputsContext = createContext<FormTypeInputsContextProps>(
  {} as FormTypeInputsContextProps,
);
