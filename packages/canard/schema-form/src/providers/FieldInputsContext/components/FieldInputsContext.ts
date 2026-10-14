import { createContext } from 'react';

import type { NormalizedFieldInputDefinition } from '@/schema-form/helpers/fieldInputDefinition';

export interface FieldInputsContext {
  /** List of FieldInputDefinition declared externally */
  fromFieldInputDefinitions: NormalizedFieldInputDefinition[];
  /** Map of FieldInputDefinition declared externally */
  fromFieldInputMap: NormalizedFieldInputDefinition[];
}

export const FieldInputsContext = createContext<FieldInputsContext>(
  {} as FieldInputsContext,
);
