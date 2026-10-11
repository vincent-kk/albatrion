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
  FormTypeGroupRenderer: ComponentType<FormTypeRendererProps>;
  FormTypeLabelRenderer: ComponentType<FormTypeRendererProps>;
  FormTypeInputRenderer: ComponentType<FormTypeRendererProps>;
  FormTypeErrorRenderer: ComponentType<FormTypeRendererProps>;
}

const defaultRenderKit = {
  FormTypeGroupRenderer: FormGroupRenderer,
  FormTypeLabelRenderer: FormLabelRenderer,
  FormTypeInputRenderer: FormInputRenderer,
  FormTypeErrorRenderer: FormErrorRenderer,
} as const;

const defaultFormTypeInputDefinitions =
  normalizeFormTypeInputDefinitions(formTypeDefinitions);

export class PluginManager {
  private static __renderKit__: RenderKit = defaultRenderKit;

  static get FormTypeGroupRenderer() {
    return PluginManager.__renderKit__.FormTypeGroupRenderer;
  }
  static get FormTypeLabelRenderer() {
    return PluginManager.__renderKit__.FormTypeLabelRenderer;
  }
  static get FormTypeInputRenderer() {
    return PluginManager.__renderKit__.FormTypeInputRenderer;
  }
  static get FormTypeErrorRenderer() {
    return PluginManager.__renderKit__.FormTypeErrorRenderer;
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
