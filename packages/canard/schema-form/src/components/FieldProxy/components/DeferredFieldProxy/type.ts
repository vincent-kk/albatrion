import type { ComponentType } from 'react';

import type { Fn } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';
import type {
  DeferredGate,
  VirtualizationManager,
} from '@/schema-form/helpers/virtualization';

import type { FieldProxyProps } from '../../type';

export interface DeferredFieldProxyProps extends Omit<FieldProxyProps, 'node'> {
  /** Node whose React subtree mount is deferred */
  node: FieldNode;
  /** Render owner used to re-evaluate threshold and position after options change. */
  branch: FieldNode;
  /** Options revision shared by this ChildFields preparation. */
  preparedRevision: number;
  /** Form-level virtualization coordinator */
  manager: VirtualizationManager;
  /** FieldProxy handed down by the ChildField closure (avoids a circular import) */
  NodeProxy: ComponentType<FieldProxyProps>;
}

/** The position owns option cleanup so revealing does not reconnect node tracking. */
export interface DeferredRevisionGate extends DeferredGate {
  /** Undefined before subscription, cleanup while waiting, null after this position opens. */
  unsubscribeOptions: Fn | null | undefined;
}
