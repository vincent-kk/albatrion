import { type ComponentType, createContext } from 'react';

import type { Fn } from '@aileron/declare';

import type { SchemaNode } from '@/schema-form/core';
import type { FormTypeRendererProps } from '@/schema-form/types';

export interface FormTypeRendererContext {
  /** FormTypeGroupRenderer component declared externally */
  FormTypeGroupRenderer?: ComponentType<FormTypeRendererProps>;
  /** FormatError function declared externally */
  formatError?: FormTypeRendererProps['formatError'];
  /** CheckShowError function declared externally */
  checkShowError: Fn<[condition?: SchemaNode['state']], boolean>;
  /** Optional specialized renderers supplied by this form. */
  FormTypeLabelRenderer?: ComponentType<FormTypeRendererProps>;
  FormTypeInputRenderer?: ComponentType<FormTypeRendererProps>;
  FormTypeErrorRenderer?: ComponentType<FormTypeRendererProps>;
}

export const FormTypeRendererContext = createContext<FormTypeRendererContext>(
  {} as FormTypeRendererContext,
);
