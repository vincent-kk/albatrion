import type { ObjectSchema } from '@lumy/schema-form/types';

import type { SchemaNode } from '../type';

export interface ChildNode {
  isVirtualized?: boolean;
  node: SchemaNode;
}

export type VirtualReference = NonNullable<ObjectSchema['virtual']>[string];
