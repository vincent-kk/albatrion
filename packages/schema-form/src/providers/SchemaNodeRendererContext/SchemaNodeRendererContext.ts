import { type ComponentType, createContext } from 'react';

import type { SchemaNodeRendererProps } from '@lumy/schema-form/types';

export interface SchemaNodeRendererContext {
  SchemaNodeRenderer: ComponentType<SchemaNodeRendererProps>;
  formatError: SchemaNodeRendererProps['formatError'];
  checkShowError: Fn<
    [condition: { touched?: boolean; dirty?: boolean }],
    boolean
  >;
}

export const SchemaNodeRendererContext =
  createContext<SchemaNodeRendererContext>({} as SchemaNodeRendererContext);
