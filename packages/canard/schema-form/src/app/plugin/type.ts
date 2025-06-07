import type { ComponentType } from 'react';

import type {
  FormTypeInputDefinition,
  FormTypeRendererProps,
  FormatError,
  JsonSchemaError,
  JsonSchemaWithVirtual,
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
  createValidator(schema: JsonSchemaWithVirtual): ValidatorInstance;
}

export interface ValidatorInstance {
  validate(data: any): Promise<JsonSchemaError[]> | JsonSchemaError[];
}
