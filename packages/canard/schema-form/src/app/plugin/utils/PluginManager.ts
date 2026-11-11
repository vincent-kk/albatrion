import type { ComponentType } from 'react';

import { remainOnlyReactComponent } from '@winglet/react-utils/object';

import type { Optional } from '@aileron/declare';

import {
  ErrorMessageRenderer,
  FormFieldRenderer,
  LabelRenderer,
} from '@/schema-form/components/FallbackComponents';
import { builtinFieldInputDefinitions } from '@/schema-form/fieldInputs';
import { formatValidationError } from '@/schema-form/helpers/error';
import {
  type NormalizedFieldInputDefinition,
  normalizeFieldInputDefinitions,
} from '@/schema-form/helpers/fieldInputDefinition';
import type {
  ErrorMessageRendererProps,
  FieldInputDefinition,
  FieldRendererProps,
  FormatError,
  InputRendererProps,
  LabelRendererProps,
} from '@/schema-form/types';

import type { ValidatorPlugin } from '../type';

interface RenderKit {
  FieldRenderer: ComponentType<FieldRendererProps>;
  LabelRenderer: ComponentType<LabelRendererProps>;
  InputRenderer?: ComponentType<InputRendererProps>;
  ErrorMessageRenderer: ComponentType<ErrorMessageRendererProps>;
}

const defaultRenderKit = {
  FieldRenderer: FormFieldRenderer,
  LabelRenderer: LabelRenderer,
  ErrorMessageRenderer: ErrorMessageRenderer,
} as const;

const defaultFieldInputDefinitions = normalizeFieldInputDefinitions(
  builtinFieldInputDefinitions,
);

export class PluginManager {
  private static __renderKit__: RenderKit = defaultRenderKit;

  static get FieldRenderer() {
    return PluginManager.__renderKit__.FieldRenderer;
  }
  static get LabelRenderer() {
    return PluginManager.__renderKit__.LabelRenderer;
  }
  static get InputRenderer() {
    return PluginManager.__renderKit__.InputRenderer;
  }
  static get ErrorMessageRenderer() {
    return PluginManager.__renderKit__.ErrorMessageRenderer;
  }

  static appendRenderKit(renderKit: Optional<Partial<RenderKit>>) {
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
    fieldInputDefinitions: Optional<FieldInputDefinition[]>,
  ) {
    if (!fieldInputDefinitions) return;
    PluginManager.__fieldInputDefinitions__ = [
      ...normalizeFieldInputDefinitions(fieldInputDefinitions),
      ...PluginManager.__fieldInputDefinitions__,
    ];
  }

  private static __validator__: Optional<ValidatorPlugin>;

  private static __formatError__: FormatError = formatValidationError;

  static get validator() {
    return PluginManager.__validator__;
  }
  static get formatError() {
    return PluginManager.__formatError__;
  }

  static appendValidator(validator: Optional<ValidatorPlugin>) {
    if (!validator) return;
    PluginManager.__validator__ = validator;
  }
  static appendFormatError(formatError: Optional<FormatError>) {
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
