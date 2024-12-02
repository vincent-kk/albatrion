import { type ComponentType, createContext } from 'react';

import type { FormTypeRendererProps } from '@lumy/schema-form/types';

export interface FormTypeRendererContext {
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  formatError?: FormTypeRendererProps['formatError'];
  checkShowError: Fn<
    [condition: { touched?: boolean; dirty?: boolean }],
    boolean
  >;
}

export const FormTypeRendererContext = createContext<FormTypeRendererContext>(
  {} as FormTypeRendererContext,
);
