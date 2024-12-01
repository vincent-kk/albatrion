import { type ComponentType, createContext } from 'react';

import {
  FormGroupRenderer,
  FormInputRenderer,
  FormLabelRenderer,
  FromErrorRenderer,
} from '@lumy/schema-form/components/FallbackComponents';
import { formatError } from '@lumy/schema-form/components/utils/formatError';
import type { NormalizedFormTypeInputDefinition } from '@lumy/schema-form/helpers/formTypeInputDefinition';
import type { FormTypeRendererProps } from '@lumy/schema-form/types';

export interface ExternalFormContextProps {
  fromExternalFormTypeInputDefinitions: NormalizedFormTypeInputDefinition[];
  FallbackFormTypeRenderer: ComponentType<FormTypeRendererProps>;
  FallbackFormLabelRenderer: ComponentType<FormTypeRendererProps>;
  FallbackFormInputRenderer: ComponentType<FormTypeRendererProps>;
  FallbackFormErrorRenderer: ComponentType<FormTypeRendererProps>;
  fallbackFormatError: FormTypeRendererProps['formatError'];
}

export const ExternalFormContext = createContext<ExternalFormContextProps>({
  fromExternalFormTypeInputDefinitions: [],
  FallbackFormTypeRenderer: FormGroupRenderer,
  FallbackFormLabelRenderer: FormLabelRenderer,
  FallbackFormInputRenderer: FormInputRenderer,
  FallbackFormErrorRenderer: FromErrorRenderer,
  fallbackFormatError: formatError,
});
