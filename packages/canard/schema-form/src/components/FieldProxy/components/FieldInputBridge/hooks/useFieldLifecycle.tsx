// isCommittedRef is read during render to mount a detector only for already committed positions with Render work.
import {
  type ReactNode,
  type RefObject,
  useLayoutEffect,
  useMemo,
} from 'react';

import type { Fn, Nullable, Optional } from '@aileron/declare';

import { type FieldNode, FieldNodeEventType } from '@/schema-form/core';
import {
  FieldLifecycle,
  FieldLifecycleAction,
} from '@/schema-form/helpers/fieldLifecycle';
import type { FieldLifecycleRegistry } from '@/schema-form/helpers/fieldLifecycle/FieldLifecycleRegistry';
import type { VirtualizationManager } from '@/schema-form/helpers/virtualization';
import type { AttachedFilesStore } from '@/schema-form/providers/WorkspaceContext';

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
 * @param update - Stable bridge dispatch used after a committed container replacement.
 * @param attachedFiles - Form-owned records projected on committed path deliveries.
 * @returns Stable position with its callback ref, replacement epoch and optional Render detector.
 */
export const useFieldLifecycle = (
  node: FieldNode,
  container: RefObject<Nullable<HTMLDivElement>>,
  commitTerminalChildren: Fn,
  releaseComposition: Fn,
  hydrationCommitRef: Optional<RefObject<boolean>>,
  virtualizationManager: Nullable<VirtualizationManager>,
  lifecycle: Nullable<FieldLifecycleRegistry>,
  update: Fn,
  attachedFiles?: AttachedFilesStore,
) => {
  const position = useMemo(() => {
    const isCommittedRef = { current: false };
    let registered: Nullable<HTMLDivElement> = null;
    let fired = false;
    const ref = (element: Nullable<HTMLDivElement>) => {
      container.current = element;
      if (!element || !isCommittedRef.current || element === registered) return;
      releaseComposition();
      if (registered) virtualizationManager?.detachInput(registered);
      virtualizationManager?.attachInput(element, node);
      registered = element;
      position.epoch++;
      update();
    };
    const effect = () => {
      commitTerminalChildren();
      if (hydrationCommitRef) hydrationCommitRef.current = true;
      virtualizationManager?.markRevealed(node);
      const element = container.current;
      registered = element;
      if (element) virtualizationManager?.attachInput(element, node);
      const unsubscribe = node.subscribe(({ type }) => {
        if (type & FieldNodeEventType.UpdatePath) attachedFiles?.synchronize();
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
          if (lifecycle.pendingMask & FieldLifecycle.Mount)
            runSlotAction(element, lifecycle.fire(node, FieldLifecycle.Mount));
          if (lifecycle.pendingMask & FieldLifecycle.Render)
            runSlotAction(element, lifecycle.fire(node, FieldLifecycle.Render));
        }
      }
      isCommittedRef.current = true;
      return () => {
        isCommittedRef.current = false;
        releaseComposition();
        unsubscribe();
        if (registered) virtualizationManager?.detachInput(registered);
        if (
          registered &&
          lifecycle &&
          lifecycle.pendingMask & FieldLifecycle.Unmount
        )
          lifecycle.fire(node, FieldLifecycle.Unmount);
        registered = null;
      };
    };
    const position = {
      isCommittedRef,
      effect,
      ref,
      epoch: 0,
      detector: null as ReactNode,
    };
    return position;
  }, [
    node,
    container,
    commitTerminalChildren,
    releaseComposition,
    hydrationCommitRef,
    virtualizationManager,
    lifecycle,
    update,
    attachedFiles,
  ]);
  const { effect } = position;
  useLayoutEffect(effect, [effect]);
  position.detector =
    lifecycle &&
    position.isCommittedRef.current &&
    lifecycle.pendingMask & FieldLifecycle.Render &&
    lifecycle.has(node, FieldLifecycle.Render) ? (
      <FieldLifecycleRender
        node={node}
        container={container}
        isCommittedRef={position.isCommittedRef}
        lifecycle={lifecycle}
      />
    ) : null;
  return position;
};
