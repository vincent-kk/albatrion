import { type ComponentType, createContext } from 'react';

import type { Dictionary } from '@aileron/declare';

import type { ValidationMode } from '@/schema-form/core';
import type { Ajv } from '@/schema-form/helpers/ajv';
import type { NormalizedFormTypeInputDefinition } from '@/schema-form/helpers/formTypeInputDefinition';
import type {
  FormTypeRendererProps,
  FormatError,
  ShowError,
} from '@/schema-form/types';

export interface ExternalFormContext {
  /** List of FormTypeInputDefinition declared externally */
  fromExternalFormTypeInputDefinitions?: NormalizedFormTypeInputDefinition[];
  /** FormGroupRenderer component declared externally */
  FormGroupRenderer?: ComponentType<FormTypeRendererProps>;
  /** FormLabelRenderer component declared externally */
  FormLabelRenderer?: ComponentType<FormTypeRendererProps>;
  /** FormInputRenderer component declared externally */
  FormInputRenderer?: ComponentType<FormTypeRendererProps>;
  /** FormErrorRenderer component declared externally */
  FormErrorRenderer?: ComponentType<FormTypeRendererProps>;
  /** FormatError function declared externally */
  formatError?: FormatError;
  /** Error display condition (default: ShowError.DirtyTouched) */
  showError?: boolean | ShowError;
  /** Execute Validation Mode (default: ValidationMode.OnChange) */
  validationMode?: ValidationMode;
  /** Global user-defined context, merged with user-defined context */
  context?: Dictionary;
  /** Ajv instance declared externally, creates internally if not provided */
  ajv?: Ajv;
}

export const ExternalFormContext = createContext<ExternalFormContext>(
  {} as ExternalFormContext,
);
