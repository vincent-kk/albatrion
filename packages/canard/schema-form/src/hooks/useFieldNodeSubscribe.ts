import { useLayoutEffect } from 'react';

import { useHandle } from '@winglet/react-utils/hook';

import type { Fn } from '@aileron/declare';

import type { FieldNode } from '@/schema-form/core';

/** Catch-up callback for state delivered before the subscription commits. */
export interface FieldNodeSubscribeOptions<
  Node extends {
    subscribe(listener: Parameters<FieldNode['subscribe']>[0]): Fn;
    revision(mask?: number): number;
  },
> {
  /**
   * Called once right after the subscription attaches (and again whenever it
   * re-attaches for a new node). Use it to catch up: re-read the current node
   * state that `listener` would otherwise have derived from events.
   *
   * Node events are synchronous and this subscription only attaches at
   * commit, so events delivered in the render→commit gap of a concurrent
   * mount (Suspense retry / transition) reach zero listeners and are NOT
   * replayed. Any listener that mirrors node state into React state MUST
   * provide this catch-up (or use `useFieldNodeTracker` and read node
   * getters during render, which is gap-safe by contract).
   */
  onSubscribe?: Fn<[node: Node]>;
}

/**
 * Hook for subscribing to field node events.
 *
 * The listener only observes events delivered AFTER the subscription attaches
 * (at commit). If the listener mirrors node state, pass `options.onSubscribe`
 * to re-read the current state at attach time — otherwise deliveries that
 * happened between render and commit are silently lost under React concurrent
 * rendering. For plain "re-render on node change" use `useFieldNodeTracker`
 * instead.
 *
 * @param node - Node to subscribe to
 * @param listener - Event listener function
 * @param options - Subscription options (see `FieldNodeSubscribeOptions`)
 */
export const useFieldNodeSubscribe = <
  Node extends {
    subscribe(listener: Parameters<FieldNode['subscribe']>[0]): Fn;
    revision(mask?: number): number;
  },
>(
  node: Node | null,
  listener: Parameters<FieldNode['subscribe']>[0],
  options?: FieldNodeSubscribeOptions<Node>,
) => {
  const handleListener = useHandle(listener);
  const handleSubscribe = useHandle(options?.onSubscribe);
  useLayoutEffect(() => {
    if (node === null) return;
    const unsubscribe = node.subscribe(handleListener);
    handleSubscribe(node);
    return unsubscribe;
  }, [node, handleListener, handleSubscribe]);
};
