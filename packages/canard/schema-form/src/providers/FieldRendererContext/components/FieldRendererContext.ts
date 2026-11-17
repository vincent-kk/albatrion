import { type ComponentType, createContext } from 'react';

import type { Fn } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';
import type {
  ErrorMessageRendererProps,
  FieldRendererProps,
  InputRendererProps,
  LabelRendererProps,
} from '@/schema-form/types';

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
  LabelRenderer?: ComponentType<LabelRendererProps>;
  InputRenderer?: ComponentType<InputRendererProps>;
  ErrorMessageRenderer?: ComponentType<ErrorMessageRendererProps>;
}

export const FieldRendererContext = createContext<FieldRendererContext>(
  {} as FieldRendererContext,
);
