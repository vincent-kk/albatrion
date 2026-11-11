// committed is read during render to mount a detector only for already committed positions with Render work.
import {
  type ComponentType,
  type ReactNode,
  type RefObject,
  useLayoutEffect,
  useMemo,
} from 'react';

import type { Nullable, Optional } from '@aileron/declare';

import { type FieldNode, FieldNodeEventType } from '@/schema-form/core';
import {
  FieldLifecycle,
  FieldLifecycleAction,
} from '@/schema-form/helpers/fieldLifecycle';
import type { FieldLifecycleRegistry } from '@/schema-form/helpers/fieldLifecycle/FieldLifecycleRegistry';
import type { VirtualizationManager } from '@/schema-form/helpers/virtualization';
import type { InputRendererProps } from '@/schema-form/types';

import { FieldLifecycleRender } from '../components/FieldLifecycleRender';
import { runSlotAction } from '../utils/runSlotAction';

/**
 * Own the input position's single layout effect and optional Render detector.
 * @param node - Live field whose requests and reservations belong to this position.
 * @param container - Input container ref, attached before its owning effect runs.
 * @param commitTerminalChildren - Stable terminal-read warning commit marker.
 * @param releaseComposition - Stable cleanup of input composition deferral.
 * @param hydrationCommitRef - Server snapshot marker settled before passive consistency checks.
 * @param virtualizationManager - Form manager only when this position renders an input.
 * @param lifecycle - Form registry only when this position renders an input.
 * @param Frame - Selected frame whose replacement creates a new input position.
 * @returns A detector only while this committed field has Render reservations.
 */
export const useFieldLifecycle = (
  node: FieldNode,
  container: RefObject<Nullable<HTMLDivElement>>,
  commitTerminalChildren: () => void,
  releaseComposition: () => void,
  hydrationCommitRef: Optional<RefObject<boolean>>,
  virtualizationManager: Nullable<VirtualizationManager>,
  lifecycle: Nullable<FieldLifecycleRegistry>,
  Frame: Nullable<ComponentType<InputRendererProps>> = null,
): ReactNode => {
  const { committed, effect } = useMemo(() => {
    const committed = { current: false };
    let fired = false;
    const effect = () => {
      commitTerminalChildren();
      if (hydrationCommitRef) hydrationCommitRef.current = true;
      virtualizationManager?.markRevealed(node);
      const element = container.current;
      if (element) virtualizationManager?.attachInput(element, node);
      const unsubscribe = node.subscribe(({ type }) => {
        let action = FieldLifecycleAction.None;
        if (type & FieldNodeEventType.RequestFocus)
          action |= FieldLifecycleAction.Focus;
        if (type & FieldNodeEventType.RequestSelect)
          action |= FieldLifecycleAction.Select;
        if (action) runSlotAction(container.current, action);
      });
      if (!fired) {
        fired = true;
        if (lifecycle && element) {
          if (lifecycle.pending & FieldLifecycle.Mount)
            runSlotAction(element, lifecycle.fire(node, FieldLifecycle.Mount));
          if (lifecycle.pending & FieldLifecycle.Render)
            runSlotAction(element, lifecycle.fire(node, FieldLifecycle.Render));
        }
      }
      committed.current = true;
      return () => {
        committed.current = false;
        releaseComposition();
        unsubscribe();
        if (element) virtualizationManager?.detachInput(element);
        if (element && lifecycle && lifecycle.pending & FieldLifecycle.Unmount)
          lifecycle.fire(node, FieldLifecycle.Unmount);
      };
    };
    return { committed, effect };
    // A new frame replaces the container even when the node is unchanged.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    node,
    container,
    commitTerminalChildren,
    releaseComposition,
    hydrationCommitRef,
    virtualizationManager,
    lifecycle,
    Frame,
  ]);
  useLayoutEffect(effect, [effect]);
  return lifecycle &&
    committed.current &&
    lifecycle.pending & FieldLifecycle.Render &&
    lifecycle.has(node, FieldLifecycle.Render) ? (
    <FieldLifecycleRender
      node={node}
      container={container}
      committed={committed}
      lifecycle={lifecycle}
    />
  ) : null;
};
