import { createContext } from 'react';

import type { SchemaNode } from '@lumy/schema-form/core';

interface SchemaNodeContext {
  rootNode: SchemaNode;
}

export const SchemaNodeContext = createContext<SchemaNodeContext>(
  {} as SchemaNodeContext,
);
