import { createContext } from 'react';

import type { NormalizedFormTypeInputDefinition } from '@lumy/schema-form/helpers/formTypeInputDefinition';

export const FormTypeInputsContext = createContext<
  NormalizedFormTypeInputDefinition[]
>([]);
