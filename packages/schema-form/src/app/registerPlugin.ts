import type { ComponentType } from 'react';

import type {
  FormTypeInputDefinition,
  FormTypeRendererProps,
  FormatError,
} from '../types';
import { BaseFormTypeManager } from './BaseFormTypeManager';

export const registerPlugin = ({
  FormGroup,
  FormLabel,
  FormInput,
  FormError,
  formatError,
  formTypeInputDefinitions,
}: Plugin) => {
  BaseFormTypeManager.appendFormType({
    FormGroup,
    FormLabel,
    FormInput,
    FormError,
    formatError,
  });
  BaseFormTypeManager.appendFormTypeInputDefinitions(formTypeInputDefinitions);
};

export interface Plugin {
  FormGroup?: ComponentType<FormTypeRendererProps>;
  FormLabel?: ComponentType<FormTypeRendererProps>;
  FormInput?: ComponentType<FormTypeRendererProps>;
  FormError?: ComponentType<FormTypeRendererProps>;
  formatError?: FormatError;
  formTypeInputDefinitions?: FormTypeInputDefinition[];
}
