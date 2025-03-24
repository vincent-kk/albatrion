import { createContext } from 'react';

import type { SchemaNode } from '@/schema-form/core';

export interface RootNodeContext {
  rootNode: SchemaNode;
  readOnly?: boolean;
  disabled?: boolean;
}

export const RootNodeContext = createContext<RootNodeContext>(
  {} as RootNodeContext,
);
