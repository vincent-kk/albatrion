import type { ComponentType } from 'react';

import { remainOnlyReactComponent } from '@winglet/react-utils';

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

interface RenderKit {
  FormGroup: ComponentType<FormTypeRendererProps>;
  FormLabel: ComponentType<FormTypeRendererProps>;
  FormInput: ComponentType<FormTypeRendererProps>;
  FormError: ComponentType<FormTypeRendererProps>;
  formatError: FormatError;
}

export class PluginManager {
  static __renderKit__: RenderKit = {
    FormGroup: FormGroupRenderer,
    FormLabel: FormLabelRenderer,
    FormInput: FormInputRenderer,
    FormError: FormErrorRenderer,
    formatError: formatError,
  };
  static __formTypeInputDefinitions__: NormalizedFormTypeInputDefinition[] =
    normalizeFormTypeInputDefinitions(formTypeDefinitions);

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
  static get formatError() {
    return PluginManager.__renderKit__.formatError;
  }
  static get formTypeInputDefinitions() {
    return PluginManager.__formTypeInputDefinitions__;
  }

  static appendRenderKit(renderKit: Partial<RenderKit> | undefined) {
    if (!renderKit) return;
    const { formatError, ...FromTypes } = renderKit;
    PluginManager.__renderKit__ = {
      ...PluginManager.__renderKit__,
      ...remainOnlyReactComponent(FromTypes),
      ...(formatError && { formatError }),
    };
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
}
