import { createContext } from 'react';

import { EMPTY_ARRAY } from '@winglet/common-utils';

import type { NormalizedFormTypeInputDefinition } from '@/schema-form/helpers/formTypeInputDefinition';

export interface FormTypeInputsContext {
  fromFormTypeInputDefinitions: NormalizedFormTypeInputDefinition[];
  fromFormTypeInputMap: NormalizedFormTypeInputDefinition[];
}

export const FormTypeInputsContext = createContext<FormTypeInputsContext>({
  fromFormTypeInputDefinitions: EMPTY_ARRAY,
  fromFormTypeInputMap: EMPTY_ARRAY,
} as FormTypeInputsContext);
