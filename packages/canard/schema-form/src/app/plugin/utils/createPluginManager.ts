import { remainOnlyReactComponent } from '@winglet/react-utils/object';

import { formatValidationError } from '@/schema-form/helpers/error';
import { normalizeFieldInputDefinitions } from '@/schema-form/helpers/fieldInputDefinition';

import type { SchemaFormPlugin } from '../type';
import type { getPluginRegistry } from './getPluginRegistry';

/**
 * Bind static plugin operations to one registry without per-field lookups.
 * @param registry - Version-compatible registry chosen by the application boundary.
 * @returns Static manager whose methods retain that registry.
 */
export const createPluginManager = (
  registry: ReturnType<typeof getPluginRegistry>,
) => {
  const { getPluginKey, registeredPlugins } = registry;
  return class RegistryPluginManager {
    static get FieldRenderer() {
      return registry.renderKit.FieldRenderer;
    }
    static get LabelRenderer() {
      return registry.renderKit.LabelRenderer;
    }
    static get InputRenderer() {
      return registry.renderKit.InputRenderer;
    }
    static get ErrorMessageRenderer() {
      return registry.renderKit.ErrorMessageRenderer;
    }

    static get fieldInputDefinitions() {
      return registry.fieldInputDefinitions;
    }

    static get validator() {
      return registry.validator;
    }
    static get formatError() {
      return registry.formatError;
    }

    /** Apply one normalized plugin to this manager's registry, once per fingerprint. */
    static register(configuration: SchemaFormPlugin): void {
      const hash = getPluginKey(configuration);
      if (registeredPlugins.has(hash)) return;
      const { fieldInputDefinitions, validator, formatError, ...renderKit } =
        configuration;
      // Normalize before changing the other fields, so a failure cannot partially register a plugin.
      if (fieldInputDefinitions)
        registry.fieldInputDefinitions = [
          ...normalizeFieldInputDefinitions(fieldInputDefinitions),
          ...registry.fieldInputDefinitions,
        ];
      registry.renderKit = {
        ...registry.renderKit,
        ...remainOnlyReactComponent(renderKit),
      };
      if (validator) registry.validator = validator;
      if (formatError) registry.formatError = formatError;
      registeredPlugins.add(hash);
    }

    static reset() {
      registry.renderKit = registry.defaultRenderKit;
      registry.fieldInputDefinitions = registry.defaultFieldInputDefinitions;
      registry.validator = undefined;
      registry.formatError = formatValidationError;
      registeredPlugins.clear();
    }
  };
};
