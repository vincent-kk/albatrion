import { type ComponentType, createContext } from 'react';

import type { Dictionary } from '@aileron/declare';

import type { ValidationMode } from '@/schema-form/core';
import { PluginManager } from '@/schema-form/app/plugin';
import type { NormalizedFieldInputDefinition } from '@/schema-form/helpers/fieldInputDefinition';
import type {
  ErrorMessageRendererProps,
  ErrorVisibility,
  FieldRendererProps,
  FormatError,
  InputRendererProps,
  LabelRendererProps,
  ValidatorFactory,
} from '@/schema-form/types';

export interface ExternalFormContext {
  /** Registry selected once at the application provider boundary. */
  pluginManager: typeof PluginManager;
  /** List of FieldInputDefinition declared externally */
  fromExternalFieldInputDefinitions?: NormalizedFieldInputDefinition[];
  /** FieldRenderer component declared externally */
  FieldRenderer?: ComponentType<FieldRendererProps>;
  /** LabelRenderer component declared externally */
  LabelRenderer?: ComponentType<LabelRendererProps>;
  /** InputRenderer component declared externally */
  InputRenderer?: ComponentType<InputRendererProps>;
  /** ErrorMessageRenderer component declared externally */
  ErrorMessageRenderer?: ComponentType<ErrorMessageRendererProps>;
  /** FormatError function declared externally */
  formatError?: FormatError;
  /** Error display condition (default: ErrorVisibility.AfterEditAndTouch) */
  errorVisibility?: ErrorVisibility;
  /** Execute Validation Mode (default: ValidationMode.OnChange | ValidationMode.OnRequest) */
  validationMode?: ValidationMode;
  /** Global user-defined context, merged with user-defined context */
  context?: Dictionary;
  /** ValidatorFactory externally, creates internally if not provided */
  validatorFactory?: ValidatorFactory;
}

export const ExternalFormContext = createContext<ExternalFormContext>(
  { pluginManager: PluginManager },
);
