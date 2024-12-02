import { type ComponentType, createContext } from 'react';

import type { NormalizedFormTypeInputDefinition } from '@lumy/schema-form/helpers/formTypeInputDefinition';
import type {
  FormTypeRendererProps,
  FormatError,
} from '@lumy/schema-form/types';

export interface ExternalFormContextProps {
  fromExternalFormTypeInputDefinitions?: NormalizedFormTypeInputDefinition[];
  FormGroupRenderer?: ComponentType<FormTypeRendererProps>;
  FormLabelRenderer?: ComponentType<FormTypeRendererProps>;
  FormInputRenderer?: ComponentType<FormTypeRendererProps>;
  FormErrorRenderer?: ComponentType<FormTypeRendererProps>;
  formatError?: FormatError;
}

export const ExternalFormContext = createContext<ExternalFormContextProps>({});
