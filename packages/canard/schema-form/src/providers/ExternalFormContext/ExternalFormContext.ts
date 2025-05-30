import { type ComponentType, createContext } from 'react';

import type { ValidationMode } from '@/schema-form/core';
import type { Ajv } from '@/schema-form/helpers/ajv';
import type { NormalizedFormTypeInputDefinition } from '@/schema-form/helpers/formTypeInputDefinition';
import type {
  FormTypeRendererProps,
  FormatError,
  ShowError,
} from '@/schema-form/types';

export interface ExternalFormContext {
  fromExternalFormTypeInputDefinitions?: NormalizedFormTypeInputDefinition[];
  FormGroupRenderer?: ComponentType<FormTypeRendererProps>;
  FormLabelRenderer?: ComponentType<FormTypeRendererProps>;
  FormInputRenderer?: ComponentType<FormTypeRendererProps>;
  FormErrorRenderer?: ComponentType<FormTypeRendererProps>;
  formatError?: FormatError;
  showError?: boolean | ShowError;
  validationMode?: ValidationMode;
  ajv?: Ajv;
}

export const ExternalFormContext = createContext<ExternalFormContext>(
  {} as ExternalFormContext,
);
