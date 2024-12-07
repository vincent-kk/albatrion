import { createContext } from 'react';

import type { SchemaNode } from '@/schema-form/core';

export const RootNodeContext = createContext<SchemaNode>({} as SchemaNode);
