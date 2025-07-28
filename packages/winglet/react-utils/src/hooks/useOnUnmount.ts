import { useEffect } from 'react';

import type { Fn } from '@aileron/declare';

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
 * - **Memory Management**: Clear caches, release large objects, or cleanup workers
 *
 * ### Critical Limitations
 * - **Stale Closure Warning**: The handler function captures values at mount time only
 * - **No State Updates**: Handler won't see later state or prop changes
 * - **Single Execution**: Only runs on unmount, never on dependency changes
 *
 * ### Solutions for Current State Access
 * Use `useReference` or `useRef` to access current values in cleanup:
 *
 * @example
 * ```typescript
 * // ❌ Problematic: captures stale state
 * const [count, setCount] = useState(0);
 * useOnUnmount(() => {
 *   console.log(count); // Always logs initial value (0)
 * });
 *
 * // ✅ Correct: access current state
 * const [count, setCount] = useState(0);
 * const countRef = useReference(count);
 * useOnUnmount(() => {
 *   console.log(countRef.current); // Logs current value
 * });
 *
 * // Cancel ongoing requests with current context
 * const controller = useRef(new AbortController());
 * const userIdRef = useReference(userId);
 *
 * useOnUnmount(() => {
 *   controller.current.abort();
 *   analytics.track('UserSessionEnd', {
 *     userId: userIdRef.current,
 *     timestamp: Date.now()
 *   });
 * });
 *
 * // Save draft with current form state
 * const formDataRef = useReference(formData);
 * const isDirtyRef = useReference(isDirty);
 *
 * useOnUnmount(() => {
 *   if (isDirtyRef.current) {
 *     localStorage.setItem('draft', JSON.stringify(formDataRef.current));
 *   }
 * });
 *
 * // Third-party library cleanup
 * const chartInstance = useRef<Chart>();
 *
 * useOnMount(() => {
 *   chartInstance.current = new Chart(canvasRef.current, config);
 * });
 *
 * useOnUnmount(() => {
 *   chartInstance.current?.destroy();
 *   chartInstance.current = undefined;
 * });
 *
 * // Multiple timer cleanup with Set
 * const activeTimers = useRef(new Set<NodeJS.Timer>());
 *
 * const scheduleTimer = useCallback((callback: () => void, delay: number) => {
 *   const timer = setTimeout(() => {
 *     activeTimers.current.delete(timer);
 *     callback();
 *   }, delay);
 *   activeTimers.current.add(timer);
 *   return timer;
 * }, []);
 *
 * useOnUnmount(() => {
 *   activeTimers.current.forEach(timer => clearTimeout(timer));
 *   activeTimers.current.clear();
 * });
 *
 * // WebSocket with graceful shutdown
 * const wsRef = useRef<WebSocket>();
 * const connectionStateRef = useReference(connectionState);
 *
 * useOnUnmount(() => {
 *   if (wsRef.current && connectionStateRef.current === 'connected') {
 *     wsRef.current.close(1000, 'Component unmounting');
 *   }
 * });
 * ```
 *
 * @param handler - The cleanup function to execute when the component unmounts
 */
export const useOnUnmount = (handler: Fn) => {
  useEffect(() => {
    return handler;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
