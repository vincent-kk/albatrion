import { remainOnlyReactComponent } from '@winglet/react-utils/object';

import type { Optional } from '@aileron/declare';

import { formatValidationError } from '@/schema-form/helpers/error';
import { normalizeFieldInputDefinitions } from '@/schema-form/helpers/fieldInputDefinition';
import type { FieldInputDefinition, FormatError } from '@/schema-form/types';

import type { ValidatorPlugin } from '../type';
import { getPluginRegistry } from './getPluginRegistry';

/**
 * Bind static plugin operations to one registry without per-field lookups.
 * @param registry - Version-compatible registry chosen by the application boundary.
 * @returns Static manager whose methods retain that registry.
 */
export const createPluginManager = (registry: ReturnType<typeof getPluginRegistry>) => {
  type RenderKit = typeof registry.renderKit;
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

  static appendRenderKit(renderKit: Optional<Partial<RenderKit>>) {
    if (!renderKit) return;
    registry.renderKit = {
      ...registry.renderKit,
      ...remainOnlyReactComponent(renderKit),
    };
  }

  static get fieldInputDefinitions() {
    return registry.fieldInputDefinitions;
  }

  static appendFieldInputDefinitions(
    fieldInputDefinitions: Optional<FieldInputDefinition[]>,
  ) {
    if (!fieldInputDefinitions) return;
    registry.fieldInputDefinitions = [
      ...normalizeFieldInputDefinitions(fieldInputDefinitions),
      ...registry.fieldInputDefinitions,
    ];
  }

  static get validator() {
    return registry.validator;
  }
  static get formatError() {
    return registry.formatError;
  }

  static appendValidator(validator: Optional<ValidatorPlugin>) {
    if (!validator) return;
    registry.validator = validator;
  }
  static appendFormatError(formatError: Optional<FormatError>) {
    if (!formatError) return;
    registry.formatError = formatError;
  }

  static reset() {
    registry.renderKit = registry.defaultRenderKit;
    registry.fieldInputDefinitions = registry.defaultFieldInputDefinitions;
    registry.validator = undefined;
    registry.formatError = formatValidationError;
    registry.registeredPlugins.clear();
  }
};
};
