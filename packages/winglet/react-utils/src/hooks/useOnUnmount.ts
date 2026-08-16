import { useEffect } from 'react';

import type { Fn } from '@aileron/declare';

import { useReference } from './useReference';

/**
 * Executes a cleanup function when the component unmounts.
 *
 * This hook provides a semantic and intentional way to handle cleanup logic that should
 * only run when a component is removed from the DOM. It offers cleaner syntax than
 * remembering to return cleanup functions from `useEffect` and makes unmount logic explicit.
 *
 * ### Use Cases
 * - **Resource Cleanup**: Cancel subscriptions, timers, or async operations
 * - **Event Listener Removal**: Clean up global event listeners
 * - **Connection Closure**: Close WebSocket, SSE, or database connections
 * - **State Persistence**: Save component state before unmounting
 * - **Analytics Tracking**: Record session duration or usage metrics
 *
 * ### Handler Freshness
 * The handler passed on the most recent render is the one that runs, so it observes the
 * props and state of that render — no `useRef` dance is needed to reach current values.
 * The handler is never invoked on re-renders, only on unmount.
 *
 * @example
 * ```typescript
 * // Reads the value from the last render, not from mount
 * const [count, setCount] = useState(0);
 * useOnUnmount(() => reportSessionLength(count));
 *
 * // Cancel in-flight work and record the session
 * const controller = useRef(new AbortController());
 * useOnUnmount(() => {
 *   controller.current.abort();
 *   analytics.track('UserSessionEnd', { userId });
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Third-party library cleanup
 * const chartInstance = useRef<Chart>();
 * useOnMount(() => {
 *   chartInstance.current = new Chart(canvasRef.current, config);
 * });
 * useOnUnmount(() => {
 *   chartInstance.current?.destroy();
 *   chartInstance.current = undefined;
 * });
 * ```
 *
 * @param handler - The cleanup function to execute when the component unmounts
 *
 * @see useOnUnmountLayout - Runs the same cleanup synchronously, before the browser paints
 */
export const useOnUnmount = (handler: Fn) => {
  const handlerRef = useReference(handler);
  useEffect(() => () => handlerRef.current(), [handlerRef]);
};
