import { createContext } from 'react';

import type { FieldNode } from '@/schema-form/core';

export const RootNodeContext = createContext<FieldNode>({} as FieldNode);
