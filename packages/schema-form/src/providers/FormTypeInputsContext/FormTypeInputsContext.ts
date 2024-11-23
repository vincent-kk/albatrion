import { createContext } from 'react';

import type { NormalizedFormTypeInputDefinition } from '@lumy/schema-form/helpers/formTypeInputDefinition';

interface FormTypeInputsContext {
  fromFormTypeInputDefinitions: NormalizedFormTypeInputDefinition[];
  fromFormTypeInputMap: NormalizedFormTypeInputDefinition[];
}

export const FormTypeInputsContext = createContext<FormTypeInputsContext>(
  {} as FormTypeInputsContext,
);
