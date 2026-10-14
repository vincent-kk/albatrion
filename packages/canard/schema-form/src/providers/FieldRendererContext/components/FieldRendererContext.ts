import { type ComponentType, createContext } from 'react';

import type { Fn } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';
import type { FieldRendererProps } from '@/schema-form/types';

export interface FieldRendererContext {
  /** FieldRenderer component declared externally */
  FieldRenderer?: ComponentType<FieldRendererProps>;
  /** FormatError function declared externally */
  formatError?: FieldRendererProps['formatError'];
  /** CheckShowError function declared externally */
  checkShowError: Fn<[condition?: FieldNode['state']], boolean>;
  /** Optional specialized renderers supplied by this form. */
  FormLabelRenderer?: ComponentType<FieldRendererProps>;
  FormInputRenderer?: ComponentType<FieldRendererProps>;
  FormErrorRenderer?: ComponentType<FieldRendererProps>;
}

export const FieldRendererContext = createContext<FieldRendererContext>(
  {} as FieldRendererContext,
);
