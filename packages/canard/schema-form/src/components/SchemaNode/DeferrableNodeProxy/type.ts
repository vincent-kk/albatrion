import type { ComponentType } from 'react';

import type { SchemaNode } from '@/schema-form/core';
import type { VirtualizationManager } from '@/schema-form/helpers/virtualization';

import type { SchemaNodeProxyProps } from '../SchemaNodeProxy';

export interface DeferrableNodeProxyProps
  extends Omit<SchemaNodeProxyProps, 'node'> {
  /** Node whose React subtree mount is deferred */
  node: SchemaNode;
  /** Form-level virtualization coordinator */
  manager: VirtualizationManager;
  /** SchemaNodeProxy handed down by the ChildNodeComponent closure (avoids a circular import) */
  NodeProxy: ComponentType<SchemaNodeProxyProps>;
}
