import type { ComponentType } from 'react';

import {
  generateHash,
  isPlainObject,
  stableSerialize,
} from '@winglet/common-utils';

import { UnhandledError } from '@/schema-form/errors';
import type {
  FormTypeInputDefinition,
  FormTypeRendererProps,
  FormatError,
} from '@/schema-form/types';

import { PluginManager } from './PluginManager';

const RegisteredPlugin = new Set<number>();

export const registerPlugin = (plugin: SchemaFormPlugin) => {
  if (!isPlainObject(plugin)) return;
  const hash = generateHash(stableSerialize(plugin));
  if (RegisteredPlugin.has(hash)) return;
  try {
    const { formTypeInputDefinitions, ...renderKit } = plugin;
    PluginManager.appendRenderKit(renderKit);
    PluginManager.appendFormTypeInputDefinitions(formTypeInputDefinitions);
  } catch (error) {
    throw new UnhandledError('REGISTER_PLUGIN', 'Failed to register plugin', {
      plugin,
      error,
    });
  }
  RegisteredPlugin.add(hash);
};

export interface SchemaFormPlugin {
  FormGroup?: ComponentType<FormTypeRendererProps>;
  FormLabel?: ComponentType<FormTypeRendererProps>;
  FormInput?: ComponentType<FormTypeRendererProps>;
  FormError?: ComponentType<FormTypeRendererProps>;
  formatError?: FormatError;
  formTypeInputDefinitions?: FormTypeInputDefinition[];
}
