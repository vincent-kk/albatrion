import type { ComponentType } from 'react';

import type {
  FormTypeInputDefinition,
  FormTypeRendererProps,
  FormatError,
} from '@/schema-form/types';

import { FallbackManager } from './FallbackManager';

export const registerPlugin = ({
  FormGroup,
  FormLabel,
  FormInput,
  FormError,
  formatError,
  formTypeInputDefinitions,
}: SchemaFormPlugin) => {
  FallbackManager.appendFormType({
    FormGroup,
    FormLabel,
    FormInput,
    FormError,
    formatError,
  });
  FallbackManager.appendFormTypeInputDefinitions(formTypeInputDefinitions);
};

export interface SchemaFormPlugin {
  FormGroup?: ComponentType<FormTypeRendererProps>;
  FormLabel?: ComponentType<FormTypeRendererProps>;
  FormInput?: ComponentType<FormTypeRendererProps>;
  FormError?: ComponentType<FormTypeRendererProps>;
  formatError?: FormatError;
  formTypeInputDefinitions?: FormTypeInputDefinition[];
}
