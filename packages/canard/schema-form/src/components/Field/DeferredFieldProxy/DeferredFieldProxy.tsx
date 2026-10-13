import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { FieldNodeEventType, FieldNodeRequestType } from '@/schema-form/core';
import { useFieldNodeSubscribe } from '@/schema-form/hooks/useFieldNodeSubscribe';
import { useFieldNodeTracker } from '@/schema-form/hooks/useFieldNodeTracker';
import { FormErrorPathContext } from '@/schema-form/providers/FormErrorContext';

import type { DeferredFieldProxyProps } from './type';

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
  NodeProxy,
  ...proxyProps
}: DeferredFieldProxyProps) => {
  const node = proxyProps.node;
  const [revealed, setRevealed] = useState(() => manager.hasRevealed(node));
  const pendingEventsRef = useRef(0);
  const placeholderRef = useRef<Element | null>(null);

  useFieldNodeTracker(
    node,
    FieldNodeEventType.UpdateComputedProperties | FieldNodeEventType.UpdatePath,
  );

  useFieldNodeSubscribe(revealed ? null : node, ({ type }) => {
    const forced = type & FORCE_REVEAL_EVENT;
    if (!forced) return;
    pendingEventsRef.current |= forced;
    setRevealed(true);
  });

  useLayoutEffect(() => {
    if (!revealed) return;
    manager.markRevealed(node);
    const pending = pendingEventsRef.current;
    if (pending === 0) return;
    pendingEventsRef.current = 0;
    // Synchronous re-publish: the inner control subscribed in a child layout
    // effect of this very commit, so the command cannot be lost or looped.
    if (pending & FieldNodeEventType.RequestFocus)
      node.request(FieldNodeRequestType.Focus);
    if (pending & FieldNodeEventType.RequestSelect)
      node.request(FieldNodeRequestType.Select);
  }, [revealed, manager, node]);

  const handlePlaceholder = useCallback(
    (element: HTMLDivElement | null) => {
      const previous = placeholderRef.current;
      if (previous !== null) manager.unregister(previous);
      placeholderRef.current = element;
      if (element !== null) manager.register(element, () => setRevealed(true));
    },
    [manager],
  );

  useLayoutEffect(() => {
    const element = placeholderRef.current;
    if (element === null) return;
    // React 18 replays effects without replaying DOM refs in StrictMode.
    manager.register(element, () => setRevealed(true));
    return () => manager.unregister(element);
  }, [manager, revealed, node.enabled]);

  if (!node.enabled) return null;
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
