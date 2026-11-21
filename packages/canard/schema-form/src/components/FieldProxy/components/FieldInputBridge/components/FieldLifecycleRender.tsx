import { type RefObject, useLayoutEffect, useRef } from 'react';

import type { Fn, Nullable } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';
import { FieldLifecycle } from '@/schema-form/helpers/fieldLifecycle';
import type { FieldLifecycleRegistry } from '@/schema-form/helpers/fieldLifecycle/FieldLifecycleRegistry';
import type { InputPosition } from '@/schema-form/helpers/focusTarget';

import { runSlotAction } from '../utils/runSlotAction';

/** Data from the owning input position; the detector never owns Mount. */
interface Props {
  /** Field whose Render queue is consumed. */
  node: FieldNode;
  /** Input container used for actions after queue processing. */
  container: RefObject<Nullable<HTMLDivElement>>;
  /** Current position owned by the input bridge. */
  position: InputPosition;
  /** Cleared in mutation cleanup before an updated position mounts again. */
  isCommittedRef: RefObject<boolean>;
  /** Form-local queue service. */
  lifecycle: FieldLifecycleRegistry;
}

/** Run a committed position's queued Render once; React replay retains the same effect function. */
export const FieldLifecycleRender = ({
  node,
  container,
  position,
  isCommittedRef,
  lifecycle,
}: Props) => {
  const lastEffect = useRef<Fn>(undefined);
  const effect = () => {
    if (lastEffect.current === effect) return;
    lastEffect.current = effect;
    if (isCommittedRef.current)
      runSlotAction(
        container.current,
        lifecycle.fire(node, FieldLifecycle.Render),
        position,
      );
  };
  useLayoutEffect(effect);
  return null;
};
