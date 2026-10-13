import type { ComponentType } from 'react';

import type { FieldNode } from '@/schema-form/core';
import type { VirtualizationManager } from '@/schema-form/helpers/virtualization';

import type { FieldProxyProps } from '../FieldProxy';

export interface DeferredFieldProxyProps extends Omit<FieldProxyProps, 'node'> {
  /** Node whose React subtree mount is deferred */
  node: FieldNode;
  /** Form-level virtualization coordinator */
  manager: VirtualizationManager;
  /** FieldProxy handed down by the ChildNodeComponent closure (avoids a circular import) */
  NodeProxy: ComponentType<FieldProxyProps>;
}
