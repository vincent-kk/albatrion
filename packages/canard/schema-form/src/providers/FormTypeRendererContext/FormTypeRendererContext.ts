import { type ComponentType, createContext } from 'react';

import type { Fn } from '@aileron/declare';

import type { FormTypeRendererProps } from '@/schema-form/types';

export interface FormTypeRendererContext {
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  formatError?: FormTypeRendererProps['formatError'];
  checkShowError: Fn<
    [
      condition: {
        dirty?: boolean;
        touched?: boolean;
        showError?: boolean;
      },
    ],
    boolean
  >;
}

export const FormTypeRendererContext = createContext<FormTypeRendererContext>(
  {} as FormTypeRendererContext,
);
