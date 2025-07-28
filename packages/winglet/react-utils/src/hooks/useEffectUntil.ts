import { type DependencyList, useEffect, useRef } from 'react';

/**
 * Executes an effect repeatedly until a specified condition is met, then stops permanently.
 *
 * This hook provides a way to run side effects that should continue executing on dependency
 * changes until they achieve a certain goal or condition. Once the effect returns `true`,
 * it will never run again, even if dependencies change.
 *
 * ### Use Cases
 * - **Data Loading with Retry**: Keep attempting to load data until successful
 * - **Initialization Sequences**: Try to initialize resources until all are ready
 * - **Polling Until Condition**: Poll an API until a specific status is reached
 * - **Animation Completion**: Run animation frames until target state is achieved
 * - **Resource Acquisition**: Attempt to acquire locks or resources until successful
 *
 * ### Behavior
 * - The effect runs on mount and whenever dependencies change
 * - Once the effect returns `true`, it permanently stops executing
 * - The completion state persists across re-renders
 * - No cleanup function is supported (use regular useEffect if cleanup is needed)
 *
 * @example
 * ```typescript
 * // Keep trying to connect until successful
 * useEffectUntil(() => {
 *   const socket = connectToWebSocket();
 *   if (socket.readyState === WebSocket.OPEN) {
 *     setConnection(socket);
 *     return true; // Stop trying
 *   }
 *   return false; // Keep trying
 * }, [websocketUrl]);
 *
 * // Poll API until job completes
 * useEffectUntil(() => {
 *   fetchJobStatus(jobId).then(status => {
 *     if (status === 'completed') {
 *       setResult(status.result);
 *       return true;
 *     }
 *   });
 *   return false;
 * }, [jobId, pollInterval]);
 *
 * // Initialize multiple resources
 * useEffectUntil(() => {
 *   const dbReady = database.isConnected();
 *   const cacheReady = cache.isInitialized();
 *   const configLoaded = config.isLoaded();
 *
 *   if (dbReady && cacheReady && configLoaded) {
 *     setAppReady(true);
 *     return true; // All resources ready
 *   }
 *   return false;
 * }, []);
 * ```
 *
 * @typeParam Dependencies - The type of the dependency array
 * @param effect - A function that performs side effects and returns `true` when the condition is met
 * @param dependencies - Optional dependency array that triggers re-execution when changed
 */
export const useEffectUntil = <Dependencies extends DependencyList>(
  effect: () => boolean,
  dependencies?: Dependencies,
) => {
  const isCompleted = useRef(false);
  useEffect(() => {
    if (isCompleted.current) return;
    isCompleted.current = !!effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};
