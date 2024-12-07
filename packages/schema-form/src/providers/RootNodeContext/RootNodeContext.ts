import { createContext } from 'react';

import type { SchemaNode } from '@lumy-form/core';

export const RootNodeContext = createContext<SchemaNode>({} as SchemaNode);
