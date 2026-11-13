import type { Fn } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';

import type { FieldLifecycle } from '../constants/FieldLifecycle';
import type { FieldLifecycleAction } from '../constants/FieldLifecycleAction';

/** One frozen event shared by every handler in a detached queue. */
export interface FieldLifecycleEvent {
  /** The point emitted by the input position. */
  readonly type: FieldLifecycle;
  /** The field identity whose reservation is being consumed. */
  readonly node: FieldNode;
}

/** Pure reader of the event and its closure; returns actions without writing form or DOM state. */
export type FieldLifecycleHandler = Fn<
  [event: FieldLifecycleEvent],
  FieldLifecycleAction
>;
