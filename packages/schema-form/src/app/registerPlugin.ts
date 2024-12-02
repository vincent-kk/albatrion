import type { ComponentType } from 'react';

import type {
  FormTypeInputDefinition,
  FormTypeRendererProps,
  FormatError,
} from '../types';
import { StaticManager } from './StaticManager';

export const registerPlugin = ({
  FormGroup,
  FormLabel,
  FormInput,
  FormError,
  formatError,
  formTypeInputDefinitions,
}: SchemaFormPlugin) => {
  StaticManager.appendFormType({
    FormGroup,
    FormLabel,
    FormInput,
    FormError,
    formatError,
  });
  StaticManager.appendFormTypeInputDefinitions(formTypeInputDefinitions);
};

export interface SchemaFormPlugin {
  FormGroup?: ComponentType<FormTypeRendererProps>;
  FormLabel?: ComponentType<FormTypeRendererProps>;
  FormInput?: ComponentType<FormTypeRendererProps>;
  FormError?: ComponentType<FormTypeRendererProps>;
  formatError?: FormatError;
  formTypeInputDefinitions?: FormTypeInputDefinition[];
}
