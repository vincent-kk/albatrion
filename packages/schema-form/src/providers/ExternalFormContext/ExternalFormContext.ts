import { type ComponentType, createContext } from 'react';

import { FormGroupRenderer } from '@lumy/schema-form/components/FallbackComponents';
import { formatError } from '@lumy/schema-form/components/utils/formatError';
import type { NormalizedFormTypeInputDefinition } from '@lumy/schema-form/helpers/formTypeInputDefinition';
import type { FormTypeRendererProps } from '@lumy/schema-form/types';

interface ExternalFormContextProps {
  fromExternalFormTypeInputDefinitions: NormalizedFormTypeInputDefinition[];
  FallbackFormTypeRenderer: ComponentType<FormTypeRendererProps>;
  fallbackFormatError: FormTypeRendererProps['formatError'];
}

export const ExternalFormContext = createContext<ExternalFormContextProps>({
  fromExternalFormTypeInputDefinitions: [],
  FallbackFormTypeRenderer: FormGroupRenderer,
  fallbackFormatError: formatError,
});
