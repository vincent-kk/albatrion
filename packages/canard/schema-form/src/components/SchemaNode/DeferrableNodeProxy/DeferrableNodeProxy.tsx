import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { NodeEventType } from '@/schema-form/core';
import { useSchemaNodeSubscribe } from '@/schema-form/hooks/useSchemaNodeSubscribe';
import { useSchemaNodeTracker } from '@/schema-form/hooks/useSchemaNodeTracker';

import type { DeferrableNodeProxyProps } from './type';

/**
 * Command events that force an immediate reveal and must be replayed to the
 * inner input control once it has mounted. RequestRefresh is intentionally
 * excluded: it is published to every node on external setValue/reset and
 * would un-defer the whole form.
 */
const FORCE_REVEAL_EVENT =
  NodeEventType.RequestFocus | NodeEventType.RequestSelect;

/**
 * Virtualization gate for a single schema node.
 *
 * Renders a lightweight placeholder until the node is revealed by the
 * VirtualizationManager (viewport intersection or idle backfill) or by a
 * focus/select command, then mounts the real NodeProxy subtree permanently
 * (defer-once). The node tree itself is fully alive throughout — only the
 * React mount is deferred.
 */
export const DeferrableNodeProxy = ({
  manager,
  NodeProxy,
  ...proxyProps
}: DeferrableNodeProxyProps) => {
  const node = proxyProps.node;
  const [revealed, setRevealed] = useState(() => manager.hasRevealed(node));
  const pendingEventsRef = useRef(0);
  const placeholderRef = useRef<Element | null>(null);

  useSchemaNodeTracker(node, NodeEventType.UpdateComputedProperties);

  useSchemaNodeSubscribe(revealed ? null : node, ({ type }) => {
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
    if (pending & NodeEventType.RequestFocus)
      node.publish(NodeEventType.RequestFocus, undefined, undefined, true);
    if (pending & NodeEventType.RequestSelect)
      node.publish(NodeEventType.RequestSelect, undefined, undefined, true);
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
      {Placeholder !== null && <Placeholder node={node} height={height} />}
    </div>
  );
};
