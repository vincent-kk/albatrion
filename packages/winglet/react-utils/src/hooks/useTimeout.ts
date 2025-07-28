import { useCallback, useEffect, useRef } from 'react';

import type { Fn } from '@aileron/declare';

type UseTimeoutReturn = {
  isIdle: Fn<[], boolean>;
  schedule: Fn;
  cancel: Fn;
};

/**
 * Provides imperative control over setTimeout with React-friendly state management.
 *
 * This hook creates a managed timeout system that integrates seamlessly with React's
 * lifecycle. Unlike raw setTimeout, it provides state tracking, automatic cleanup,
 * and safe callback updates without recreating timers.
 *
 * ### Key Features
 * - **Manual Control**: Explicitly schedule, reschedule, or cancel timeouts
 * - **State Tracking**: Check if a timeout is pending with `isIdle()`
 * - **Safe Updates**: Callback updates don't affect running timers
 * - **Auto-cleanup**: Prevents memory leaks on unmount
 * - **Reschedule Support**: Calling schedule() resets existing timers
 *
 * ### Use Cases
 * - **Delayed Actions**: Show notifications, hide tooltips, or auto-save
 * - **Debouncing**: Implement custom debounce logic with full control
 * - **Timeout Sequences**: Chain multiple timeouts with state awareness
 * - **Conditional Delays**: Execute actions based on timeout state
 * - **Loading States**: Auto-hide loading indicators after delay
 *
 * @example
 * ```typescript
 * // Auto-dismiss notification
 * const Notification = ({ message, duration = 3000 }) => {
 *   const { schedule, cancel } = useTimeout(() => {
 *     setVisible(false);
 *   }, duration);
 *
 *   useEffect(() => {
 *     schedule();
 *     return cancel; // Cleanup on unmount
 *   }, [schedule, cancel]);
 *
 *   return (
 *     <div onMouseEnter={cancel} onMouseLeave={schedule}>
 *       {message}
 *     </div>
 *   );
 * };
 *
 * // Loading state with timeout
 * const DataFetcher = () => {
 *   const [showSkeleton, setShowSkeleton] = useState(false);
 *   const { isIdle, schedule, cancel } = useTimeout(
 *     () => setShowSkeleton(true),
 *     200 // Show skeleton after 200ms
 *   );
 *
 *   const fetchData = async () => {
 *     schedule(); // Start skeleton timer
 *     try {
 *       const data = await api.getData();
 *       if (!isIdle()) {
 *         cancel(); // Cancel if data loads quickly
 *       }
 *       setData(data);
 *     } catch (error) {
 *       cancel();
 *       setError(error);
 *     }
 *   };
 * };
 *
 * // Sequential timeouts
 * const AnimationSequence = () => {
 *   const [stage, setStage] = useState(0);
 *
 *   const stage1Timeout = useTimeout(() => setStage(1), 1000);
 *   const stage2Timeout = useTimeout(() => setStage(2), 1000);
 *   const stage3Timeout = useTimeout(() => setStage(3), 1000);
 *
 *   useEffect(() => {
 *     if (stage === 0) stage1Timeout.schedule();
 *     else if (stage === 1) stage2Timeout.schedule();
 *     else if (stage === 2) stage3Timeout.schedule();
 *   }, [stage]);
 * };
 *
 * // Conditional execution based on state
 * const { isIdle, schedule, cancel } = useTimeout(() => {
 *   if (hasUnsavedChanges) {
 *     saveDocument();
 *   }
 * }, 5000);
 *
 * // Reschedule on user activity
 * const handleUserInput = () => {
 *   cancel();
 *   schedule(); // Reset 5-second timer
 * };
 * ```
 *
 * @param callback - The function to execute after the timeout. Can be updated without affecting running timers
 * @param timeout - The delay in milliseconds before executing the callback (default: 0)
 * @returns {Object} Control object with three methods:
 * @returns {Function} returns.isIdle - Returns true if no timeout is pending
 * @returns {Function} returns.schedule - Schedules or reschedules the timeout
 * @returns {Function} returns.cancel - Cancels any pending timeout
 */
export const useTimeout = (
  callback: Fn,
  timeout: number = 0,
): UseTimeoutReturn => {
  const idleRef = useRef<boolean>(true);
  const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const isIdle = useCallback(() => idleRef.current, []);

  const schedule = useCallback(() => {
    idleRef.current = false;
    if (timerIdRef.current !== null) clearTimeout(timerIdRef.current);
    timerIdRef.current = setTimeout(() => {
      idleRef.current = true;
      timerIdRef.current = null;
      callbackRef.current();
    }, timeout);
  }, [timeout]);

  const cancel = useCallback(() => {
    idleRef.current = true;
    if (timerIdRef.current !== null) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);

  return {
    isIdle,
    schedule,
    cancel,
  } as const;
};
