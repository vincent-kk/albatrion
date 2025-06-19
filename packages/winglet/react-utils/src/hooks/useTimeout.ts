import { useCallback, useEffect, useRef } from 'react';

import type { Fn } from '@aileron/declare';

type UseTimeoutReturn = {
  isIdle: Fn<[], boolean>;
  schedule: Fn;
  cancel: Fn;
};

/**
 * Manages a timeout that executes a callback function after a specified delay.
 * Provides manual control functions for scheduling and canceling timeouts.
 * Does not automatically start the timeout on mount - you must call schedule() manually.
 * @param callback - The function to execute after the timeout
 * @param timeout - The delay in milliseconds before executing the callback
 * @returns An object containing timeout control functions
 * @returns {Function} returns.isIdle - Function that returns whether the timeout scheduler is idle (no pending execution)
 * @returns {Function} returns.schedule - Function to schedule/reschedule the timeout
 * @returns {Function} returns.cancel - Function to cancel the timeout
 * @example
 * const { isIdle, schedule, cancel } = useTimeout(() => {
 *   console.log('Timeout executed!');
 * }, 1000);
 *
 * // Start the timeout when needed
 * const handleClick = () => {
 *   schedule();
 * };
 *
 * // Check if scheduler is idle
 * if (isIdle()) {
 *   console.log('No pending execution');
 * }
 *
 * // Cancel the timeout if needed
 * cancel();
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
