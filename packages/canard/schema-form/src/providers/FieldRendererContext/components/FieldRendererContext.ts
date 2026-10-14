import { type ComponentType, createContext } from 'react';

import type { Fn } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';
import type { BaseFieldRendererProps } from '@/schema-form/types';

export interface FieldRendererContext {
  /** FieldRenderer component declared externally */
  FieldRenderer?: ComponentType<BaseFieldRendererProps>;
  /** FormatError function declared externally */
  formatError?: BaseFieldRendererProps['formatError'];
  /** CheckShowError function declared externally */
  checkShowError: Fn<[condition?: FieldNode['state']], boolean>;
  /** Optional specialized renderers supplied by this form. */
  FormLabelRenderer?: ComponentType<BaseFieldRendererProps>;
  FormInputRenderer?: ComponentType<BaseFieldRendererProps>;
  FormErrorRenderer?: ComponentType<BaseFieldRendererProps>;
}

export const FieldRendererContext = createContext<FieldRendererContext>(
  {} as FieldRendererContext,
);
