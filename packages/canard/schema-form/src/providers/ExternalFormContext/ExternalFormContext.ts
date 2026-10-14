import { type ComponentType, createContext } from 'react';

import type { Dictionary } from '@aileron/declare';

import type { ValidationMode } from '@/schema-form/core';
import type { NormalizedFieldInputDefinition } from '@/schema-form/helpers/fieldInputDefinition';
import type {
  FieldRendererProps,
  FormatError,
  ShowError,
  ValidatorFactory,
} from '@/schema-form/types';

export interface ExternalFormContext {
  /** List of FieldInputDefinition declared externally */
  fromExternalFieldInputDefinitions?: NormalizedFieldInputDefinition[];
  /** FieldRenderer component declared externally */
  FieldRenderer?: ComponentType<FieldRendererProps>;
  /** FormLabelRenderer component declared externally */
  FormLabelRenderer?: ComponentType<FieldRendererProps>;
  /** FormInputRenderer component declared externally */
  FormInputRenderer?: ComponentType<FieldRendererProps>;
  /** FormErrorRenderer component declared externally */
  FormErrorRenderer?: ComponentType<FieldRendererProps>;
  /** FormatError function declared externally */
  formatError?: FormatError;
  /** Error display condition (default: ShowError.DirtyTouched) */
  showError?: boolean | ShowError;
  /** Execute Validation Mode (default: ValidationMode.OnChange | ValidationMode.OnRequest) */
  validationMode?: ValidationMode;
  /** Global user-defined context, merged with user-defined context */
  context?: Dictionary;
  /** ValidatorFactory externally, creates internally if not provided */
  validatorFactory?: ValidatorFactory;
}

export const ExternalFormContext = createContext<ExternalFormContext>(
  {} as ExternalFormContext,
);
