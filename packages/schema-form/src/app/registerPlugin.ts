import type { ComponentType } from 'react';

import { isPlainObject } from '@lumy-pack/common';

import type {
  FormTypeInputDefinition,
  FormTypeRendererProps,
  FormatError,
} from '@/schema-form/types';

import { FallbackManager } from './FallbackManager';

export const registerPlugin = (plugin: SchemaFormPlugin) => {
  if (!isPlainObject(plugin)) return;
  const { formTypeInputDefinitions, ...formType } = plugin;
  FallbackManager.appendFormType(formType);
  FallbackManager.appendFormTypeInputDefinitions(formTypeInputDefinitions);
};

export interface SchemaFormPlugin {
  FormGroup?: ComponentType<FormTypeRendererProps>;
  FormLabel?: ComponentType<FormTypeRendererProps>;
  FormInput?: ComponentType<FormTypeRendererProps>;
  FormError?: ComponentType<FormTypeRendererProps>;
  formatError?: FormatError;
  formTypeInputDefinitions?: FormTypeInputDefinition[];
}
