import { type ComponentType, createContext } from 'react';

import type { Fn } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';
import type { FieldRendererProps } from '@/schema-form/types';

export interface FieldRendererContext {
  /** Resolved policy rendered by this context; RootNodeContext commits it after layout. */
  errorVisibility: unknown;
  /** FieldRenderer component declared externally */
  FieldRenderer?: ComponentType<FieldRendererProps>;
  /** FormatError function declared externally */
  formatError?: FieldRendererProps['formatError'];
  /** CheckErrorVisibility function declared externally */
  checkErrorVisibility: Fn<[condition?: FieldNode['state']], boolean>;
  /** Optional specialized renderers supplied by this form. */
  LabelRenderer?: ComponentType<FieldRendererProps>;
  InputRenderer?: ComponentType<FieldRendererProps>;
  ErrorMessageRenderer?: ComponentType<FieldRendererProps>;
}

export const FieldRendererContext = createContext<FieldRendererContext>(
  {} as FieldRendererContext,
);
