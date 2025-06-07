import type { ComponentType } from 'react';

import type {
  FormTypeInputDefinition,
  FormTypeRendererProps,
  FormatError,
  ValidatorFactory,
} from '@/schema-form/types';

export interface SchemaFormPlugin {
  FormGroup?: ComponentType<FormTypeRendererProps>;
  FormLabel?: ComponentType<FormTypeRendererProps>;
  FormInput?: ComponentType<FormTypeRendererProps>;
  FormError?: ComponentType<FormTypeRendererProps>;
  formatError?: FormatError;
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  validator?: ValidatorPlugin;
}

export interface ValidatorPlugin {
  compile: ValidatorFactory;
}
