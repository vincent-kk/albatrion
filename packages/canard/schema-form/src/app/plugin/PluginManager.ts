import type { ComponentType } from 'react';

import { remainOnlyReactComponent } from '@winglet/react-utils/object';

import {
  FormErrorRenderer,
  FormGroupRenderer,
  FormInputRenderer,
  FormLabelRenderer,
} from '@/schema-form/components/FallbackComponents';
import { builtinFieldInputDefinitions } from '@/schema-form/fieldInputs';
import { formatValidationError } from '@/schema-form/helpers/error';
import {
  type NormalizedFieldInputDefinition,
  normalizeFieldInputDefinitions,
} from '@/schema-form/helpers/fieldInputDefinition';
import type {
  FieldInputDefinition,
  FieldRendererProps,
  FormatError,
} from '@/schema-form/types';

import type { ValidatorPlugin } from './type';

interface RenderKit {
  FieldRenderer: ComponentType<FieldRendererProps>;
  FormLabelRenderer: ComponentType<FieldRendererProps>;
  FormInputRenderer: ComponentType<FieldRendererProps>;
  FormErrorRenderer: ComponentType<FieldRendererProps>;
}

const defaultRenderKit = {
  FieldRenderer: FormGroupRenderer,
  FormLabelRenderer: FormLabelRenderer,
  FormInputRenderer: FormInputRenderer,
  FormErrorRenderer: FormErrorRenderer,
} as const;

const defaultFieldInputDefinitions = normalizeFieldInputDefinitions(
  builtinFieldInputDefinitions,
);

export class PluginManager {
  private static __renderKit__: RenderKit = defaultRenderKit;

  static get FieldRenderer() {
    return PluginManager.__renderKit__.FieldRenderer;
  }
  static get FormLabelRenderer() {
    return PluginManager.__renderKit__.FormLabelRenderer;
  }
  static get FormInputRenderer() {
    return PluginManager.__renderKit__.FormInputRenderer;
  }
  static get FormErrorRenderer() {
    return PluginManager.__renderKit__.FormErrorRenderer;
  }

  static appendRenderKit(renderKit: Partial<RenderKit> | undefined) {
    if (!renderKit) return;
    PluginManager.__renderKit__ = {
      ...PluginManager.__renderKit__,
      ...remainOnlyReactComponent(renderKit),
    };
  }

  private static __fieldInputDefinitions__: NormalizedFieldInputDefinition[] =
    defaultFieldInputDefinitions;

  static get fieldInputDefinitions() {
    return PluginManager.__fieldInputDefinitions__;
  }

  static appendFieldInputDefinitions(
    fieldInputDefinitions: FieldInputDefinition[] | undefined,
  ) {
    if (!fieldInputDefinitions) return;
    PluginManager.__fieldInputDefinitions__ = [
      ...normalizeFieldInputDefinitions(fieldInputDefinitions),
      ...PluginManager.__fieldInputDefinitions__,
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
    PluginManager.__fieldInputDefinitions__ = defaultFieldInputDefinitions;
    PluginManager.__validator__ = undefined;
    PluginManager.__formatError__ = formatValidationError;
  }
}
