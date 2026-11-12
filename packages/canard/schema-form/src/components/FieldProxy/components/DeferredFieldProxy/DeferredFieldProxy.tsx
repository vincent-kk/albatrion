import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { useLazyConstant } from '@winglet/react-utils/hook';

import type { Nullable } from '@aileron/declare';

import { BIT_MASK_NONE } from '@/schema-form/constants/bitmask';
import { FieldNodeEventType, FieldNodeRequestType } from '@/schema-form/core';
import { useFieldNodeSubscribe } from '@/schema-form/hooks';
import { FormErrorPathContext } from '@/schema-form/providers/FormErrorContext';

import { useDeferredRevision } from './hooks/useDeferredRevision';
import type { DeferredFieldProxyProps, DeferredRevisionGate } from './type';

/**
 * Command events that force an immediate reveal and must be replayed to the
 * inner input control once it has mounted. RequestRefresh is intentionally
 * excluded: it is published to every node on external setValue/reset and
 * would un-defer the whole form.
 */
const FORCE_REVEAL_EVENT =
  FieldNodeEventType.RequestFocus | FieldNodeEventType.RequestSelect;

/**
 * Virtualization gate for a single field node.
 *
 * Renders a lightweight placeholder until the node is revealed by the
 * VirtualizationManager (viewport intersection or idle backfill) or by a
 * focus/select command, then mounts the real NodeProxy subtree permanently
 * (defer-once). The node tree itself is fully alive throughout — only the
 * React mount is deferred.
 */
export const DeferredFieldProxy = ({
  manager,
  branch,
  preparedRevision,
  NodeProxy,
  ...proxyProps
}: DeferredFieldProxyProps) => {
  const node = proxyProps.node;
  const [revealed, setRevealed] = useState(
    () =>
      manager.hasRevealed(node) ||
      (manager.revision() !== preparedRevision &&
        !manager
          .forBranch(branch.children?.length ?? 0)
          ?.forChild(branch.children?.indexOf(node) ?? -1, node)),
  );
  const gate = useLazyConstant<DeferredRevisionGate>(() => ({
    node,
    unsubscribeOptions: revealed ? null : undefined,
    reveal: () => {
      gate.unsubscribeOptions?.();
      gate.unsubscribeOptions = null;
      setRevealed(true);
    },
  }));
  const pendingEventsRef = useRef(BIT_MASK_NONE);
  const placeholderRef = useRef<Nullable<Element>>(null);

  useDeferredRevision(node, branch, manager, preparedRevision, gate);

  useFieldNodeSubscribe(revealed ? null : node, ({ type }) => {
    const forced = type & FORCE_REVEAL_EVENT;
    if (!forced) return;
    pendingEventsRef.current |= forced;
    gate.reveal();
  });

  useLayoutEffect(() => {
    if (!revealed) return;
    manager.markRevealed(node);
    manager.settleReveal(gate);
    const pending = pendingEventsRef.current;
    if (pending === BIT_MASK_NONE) return;
    pendingEventsRef.current = BIT_MASK_NONE;
    // Synchronous re-publish: the inner control subscribed in a child layout
    // effect of this very commit, so the command cannot be lost or looped.
    if (pending & FieldNodeEventType.RequestFocus)
      node.request(FieldNodeRequestType.Focus);
    if (pending & FieldNodeEventType.RequestSelect)
      node.request(FieldNodeRequestType.Select);
  }, [revealed, manager, node, gate]);

  const handlePlaceholder = useCallback(
    (element: Nullable<HTMLDivElement>) => {
      const previous = placeholderRef.current;
      if (previous !== null) manager.unregister(previous);
      placeholderRef.current = element;
      if (element !== null) manager.register(element, gate);
    },
    [manager, gate],
  );

  useLayoutEffect(() => {
    const element = placeholderRef.current;
    if (element === null) return;
    // React 18 replays effects without replaying DOM refs in StrictMode.
    manager.register(element, gate);
    return () => {
      manager.unregister(element);
      manager.releaseGate(element);
    };
  }, [manager, gate, node.isPresent]);

  if (!node.isPresent) return null;
  if (revealed) return <NodeProxy {...proxyProps} />;

  const Placeholder = manager.Placeholder;
  const height = manager.estimateHeight(node);
  return (
    <div
      ref={handlePlaceholder}
      data-path={node.path}
      data-deferred
      aria-hidden
      style={{ height }}
    >
      {Placeholder !== null && (
        <FormErrorPathContext.Provider value={node.path}>
          <Placeholder node={node} height={height} />
        </FormErrorPathContext.Provider>
      )}
    </div>
  );
};
