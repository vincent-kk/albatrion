import type { ComponentType } from 'react';

import type { Fn } from '@aileron/declare';

import type {
  FormTypeInputDefinition,
  FormTypeRendererProps,
  FormatError,
  ValidatorFactory,
} from '@/schema-form/types';

export interface SchemaFormPlugin {
  /** Form.Group Component */
  FormGroup?: ComponentType<FormTypeRendererProps>;
  /** Form.Label Component */
  FormLabel?: ComponentType<FormTypeRendererProps>;
  /** Form.Input Component */
  FormInput?: ComponentType<FormTypeRendererProps>;
  /** Form.Error Component */
  FormError?: ComponentType<FormTypeRendererProps>;
  /** FormTypeInputDefinition */
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  /** Validator Plugin */
  validator?: ValidatorPlugin;
  /** Formatting Error Function */
  formatError?: FormatError;
}

export interface ValidatorPlugin {
  /** Inject Custom Validator Instance */
  bind: Fn<[instance: any]>;
  /** Validator Factory Function */
  compile: ValidatorFactory;
}
