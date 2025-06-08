import { Murmur3, isPlainObject, stableSerialize } from '@winglet/common-utils';

import type { SchemaFormPlugin } from '@/schema-form';
import { UnhandledError } from '@/schema-form/errors';

import { PluginManager } from './PluginManager';

const RegisteredPlugin = new Set<number>();

export const registerPlugin = (plugin: SchemaFormPlugin) => {
  if (!isPlainObject(plugin)) return;
  const hash = Murmur3.hash(stableSerialize(plugin));
  if (RegisteredPlugin.has(hash)) return;
  try {
    const { formTypeInputDefinitions, validator, formatError, ...renderKit } =
      plugin;
    PluginManager.appendRenderKit(renderKit);
    PluginManager.appendFormTypeInputDefinitions(formTypeInputDefinitions);
    PluginManager.appendValidator(validator);
    PluginManager.appendFormatError(formatError);
  } catch (error) {
    throw new UnhandledError('REGISTER_PLUGIN', 'Failed to register plugin', {
      plugin,
      error,
    });
  }
  RegisteredPlugin.add(hash);
};
