import type { ComponentType } from 'react';

import { remainOnlyReactComponent } from '@winglet/react-utils/object';

import {
  FormErrorRenderer,
  FormGroupRenderer,
  FormInputRenderer,
  FormLabelRenderer,
} from '@/schema-form/components/FallbackComponents';
import { formTypeDefinitions } from '@/schema-form/formTypeDefinitions';
import { formatValidationError } from '@/schema-form/helpers/error';
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

export class PluginManager {
  private static __renderKit__: RenderKit = defaultRenderKit;

  static get FormGroup() {
    return PluginManager.__renderKit__.FormGroup;
  }
  static get FormLabel() {
    return PluginManager.__renderKit__.FormLabel;
  }
  static get FormInput() {
    return PluginManager.__renderKit__.FormInput;
  }
  static get FormError() {
    return PluginManager.__renderKit__.FormError;
  }

  static appendRenderKit(renderKit: Partial<RenderKit> | undefined) {
    if (!renderKit) return;
    PluginManager.__renderKit__ = {
      ...PluginManager.__renderKit__,
      ...remainOnlyReactComponent(renderKit),
    };
  }

  private static __formTypeInputDefinitions__: NormalizedFormTypeInputDefinition[] =
    defaultFormTypeInputDefinitions;

  static get formTypeInputDefinitions() {
    return PluginManager.__formTypeInputDefinitions__;
  }

  static appendFormTypeInputDefinitions(
    formTypeInputDefinitions: FormTypeInputDefinition[] | undefined,
  ) {
    if (!formTypeInputDefinitions) return;
    PluginManager.__formTypeInputDefinitions__ = [
      ...normalizeFormTypeInputDefinitions(formTypeInputDefinitions),
      ...PluginManager.__formTypeInputDefinitions__,
    ];
  }

  private static __validator__: ValidatorPlugin | undefined;

  private static __formatError__: FormatError = formatValidationError;

  static get validator() {
    return PluginManager.__validator__;
  }
  static get formatError() {
    return PluginManager.__formatError__;
  }

  static appendValidator(validator: ValidatorPlugin | undefined) {
    if (!validator) return;
    PluginManager.__validator__ = validator;
  }
  static appendFormatError(formatError: FormatError | undefined) {
    if (!formatError) return;
    PluginManager.__formatError__ = formatError;
  }

  static reset() {
    PluginManager.__renderKit__ = defaultRenderKit;
    PluginManager.__formTypeInputDefinitions__ =
      defaultFormTypeInputDefinitions;
    PluginManager.__validator__ = undefined;
    PluginManager.__formatError__ = formatValidationError;
  }
}
