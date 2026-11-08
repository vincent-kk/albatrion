import { type RefObject, useLayoutEffect, useRef } from 'react';

import type { Nullable } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';
import { FieldLifecycle } from '@/schema-form/helpers/fieldLifecycle';
import type { FieldLifecycleRegistry } from '@/schema-form/helpers/fieldLifecycle/FieldLifecycleRegistry';

import { runSlotAction } from '../utils/runSlotAction';

/** Data from the owning input position; the detector never owns Mount. */
interface Props {
  /** Field whose Render queue is consumed. */
  node: FieldNode;
  /** Input container used for actions after queue processing. */
  container: RefObject<Nullable<HTMLDivElement>>;
  /** Cleared in mutation cleanup before an updated position mounts again. */
  committed: RefObject<boolean>;
  /** Form-local queue service. */
  lifecycle: FieldLifecycleRegistry;
}

/** Run a committed position's queued Render once; React replay retains the same effect function. */
export const FieldLifecycleRender = ({
  node,
  container,
  committed,
  lifecycle,
}: Props) => {
  const lastEffect = useRef<() => void>(undefined);
  const effect = () => {
    if (lastEffect.current === effect) return;
    lastEffect.current = effect;
    if (committed.current)
      runSlotAction(
        container.current,
        lifecycle.fire(node, FieldLifecycle.Render),
      );
  };
  useLayoutEffect(effect);
  return null;
};
