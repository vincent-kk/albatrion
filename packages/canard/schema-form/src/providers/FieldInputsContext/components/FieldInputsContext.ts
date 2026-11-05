import { createContext } from 'react';

import type { SchemaFormError } from '@/schema-form/errors';
import type { NormalizedFieldInputDefinition } from '@/schema-form/helpers/fieldInputDefinition';

export interface FieldInputsContext {
  /** List of FieldInputDefinition declared externally */
  fromFieldInputDefinitions: NormalizedFieldInputDefinition[];
  /** Map of FieldInputDefinition declared externally */
  fromFieldInputMap: NormalizedFieldInputDefinition[];
  /** Map configuration failure reported at commit; live failures retain the valid selection. */
  inputMapError?: SchemaFormError;
}

export const FieldInputsContext = createContext<FieldInputsContext>(
  {} as FieldInputsContext,
);
