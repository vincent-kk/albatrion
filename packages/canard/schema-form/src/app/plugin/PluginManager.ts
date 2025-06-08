import type { ComponentType } from 'react';

import { remainOnlyReactComponent } from '@winglet/react-utils/object';

import {
  FormErrorRenderer,
  FormGroupRenderer,
  FormInputRenderer,
  FormLabelRenderer,
} from '@/schema-form/components/FallbackComponents';
import { formatError } from '@/schema-form/components/utils/formatError';
import { formTypeDefinitions } from '@/schema-form/formTypeDefinitions';
import {
  type NormalizedFormTypeInputDefinition,
  normalizeFormTypeInputDefinitions,
} from '@/schema-form/helpers/formTypeInputDefinition';
import type {
  FormTypeInputDefinition,
  FormTypeRendererProps,
  FormatError,
} from '@/schema-form/types';

import { ValidatorPlugin } from './type';

interface RenderKit {
  FormGroup: ComponentType<FormTypeRendererProps>;
  FormLabel: ComponentType<FormTypeRendererProps>;
  FormInput: ComponentType<FormTypeRendererProps>;
  FormError: ComponentType<FormTypeRendererProps>;
}

export class PluginManager {
  static #renderKit: RenderKit = {
    FormGroup: FormGroupRenderer,
    FormLabel: FormLabelRenderer,
    FormInput: FormInputRenderer,
    FormError: FormErrorRenderer,
  };
  static #formTypeInputDefinitions: NormalizedFormTypeInputDefinition[] =
    normalizeFormTypeInputDefinitions(formTypeDefinitions);
  static #validator: ValidatorPlugin | undefined;
  static #formatError: FormatError = formatError;

  static get FormGroup() {
    return PluginManager.#renderKit.FormGroup;
  }
  static get FormLabel() {
    return PluginManager.#renderKit.FormLabel;
  }
  static get FormInput() {
    return PluginManager.#renderKit.FormInput;
  }
  static get FormError() {
    return PluginManager.#renderKit.FormError;
  }
  static get formatError() {
    return PluginManager.#formatError;
  }
  static get formTypeInputDefinitions() {
    return PluginManager.#formTypeInputDefinitions;
  }
  static get validator() {
    return PluginManager.#validator;
  }

  static appendRenderKit(renderKit: Partial<RenderKit> | undefined) {
    if (!renderKit) return;
    PluginManager.#renderKit = {
      ...PluginManager.#renderKit,
      ...remainOnlyReactComponent(renderKit),
    };
  }
  static appendFormTypeInputDefinitions(
    formTypeInputDefinitions: FormTypeInputDefinition[] | undefined,
  ) {
    if (!formTypeInputDefinitions) return;
    PluginManager.#formTypeInputDefinitions = [
      ...normalizeFormTypeInputDefinitions(formTypeInputDefinitions),
      ...PluginManager.#formTypeInputDefinitions,
    ];
  }
  static appendValidator(validator: ValidatorPlugin | undefined) {
    if (!validator) return;
    PluginManager.#validator = validator;
  }
  static appendFormatError(formatError: FormatError | undefined) {
    if (!formatError) return;
    PluginManager.#formatError = formatError;
  }
}
