import type { Fn } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';

/** Stable identity shared by a deferred position's ref and effect registration. */
export interface DeferredGate {
  /** Field rendered when this gate opens; virtual groups can reference siblings. */
  readonly node: FieldNode;
  /** One-way transition from the placeholder into its real subtree. */
  readonly reveal: Fn;
}
