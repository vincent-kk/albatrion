import type { ComponentType } from 'react';

import { remainOnlyReactComponent } from '@winglet/react-utils/object';

import {
  FormErrorRenderer,
  FormGroupRenderer,
  FormInputRenderer,
  FormLabelRenderer,
} from '@/schema-form/components/FallbackComponents';
import { formTypeDefinitions } from '@/schema-form/formTypeDefinitions';
import { formatError } from '@/schema-form/helpers/error';
import {
  type NormalizedFormTypeInputDefinition,
  normalizeFormTypeInputDefinitions,
} from '@/schema-form/helpers/formTypeInputDefinition';
import type {
  FormTypeInputDefinition,
  FormTypeRendererProps,
  FormatError,
} from '@/schema-form/types';

import type { ValidatorPlugin } from './type';

interface RenderKit {
  FormGroup: ComponentType<FormTypeRendererProps>;
  FormLabel: ComponentType<FormTypeRendererProps>;
  FormInput: ComponentType<FormTypeRendererProps>;
  FormError: ComponentType<FormTypeRendererProps>;
}

const defaultRenderKit = {
  FormGroup: FormGroupRenderer,
  FormLabel: FormLabelRenderer,
  FormInput: FormInputRenderer,
  FormError: FormErrorRenderer,
} as const;

const defaultFormTypeInputDefinitions =
  normalizeFormTypeInputDefinitions(formTypeDefinitions);

const defaultFormatError = formatError;

export class PluginManager {
  static #renderKit: RenderKit = defaultRenderKit;
  static #formTypeInputDefinitions: NormalizedFormTypeInputDefinition[] =
    defaultFormTypeInputDefinitions;
  static #validator: ValidatorPlugin | undefined;
  static #formatError: FormatError = defaultFormatError;

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

  static reset() {
    PluginManager.#renderKit = defaultRenderKit;
    PluginManager.#formTypeInputDefinitions = defaultFormTypeInputDefinitions;
    PluginManager.#validator = undefined;
    PluginManager.#formatError = defaultFormatError;
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
