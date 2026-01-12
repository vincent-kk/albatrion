import { type ComponentType, createContext } from 'react';

import type { Fn } from '@aileron/declare';

import type { NodeStateFlags } from '@/schema-form/core/nodes';
import type { FormTypeRendererProps } from '@/schema-form/types';

export interface FormTypeRendererContext {
  /** FormTypeRenderer component declared externally */
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  /** FormatError function declared externally */
  formatError?: FormTypeRendererProps['formatError'];
  /** CheckShowError function declared externally */
  checkShowError: Fn<[condition?: NodeStateFlags], boolean>;
}

export const FormTypeRendererContext = createContext<FormTypeRendererContext>(
  {} as FormTypeRendererContext,
);
