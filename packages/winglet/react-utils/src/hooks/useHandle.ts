import { useCallback } from 'react';

import { useReference } from './useReference';

/**
 * Creates a stable callback reference that always invokes the latest version of the provided handler.
 *
 * This hook solves the common "stale closure" problem in React by maintaining a stable
 * function reference while ensuring it always calls the most recent version of your handler.
 * It combines the benefits of `useCallback` (stable reference) with the flexibility of
 * always having access to the latest props and state.
 *
 * ### Problem it Solves
 * In React, callbacks passed to child components or used in effects often capture values
 * from their closure. When these values change, the callback becomes "stale" and operates
 * on outdated data. This hook ensures your callback always uses current values without
 * triggering re-renders in memoized components.
 *
 * ### Use Cases
 * - **Event Handlers in Memoized Components**: Pass stable callbacks without breaking memoization
 * - **Timer/Interval Callbacks**: Access latest state without recreating timers
 * - **External Library Integration**: Provide callbacks that need current component state
 * - **WebSocket/EventSource Handlers**: Handle real-time events with current state
 * - **Debounced/Throttled Functions**: Maintain stable references while using fresh data
 *
 * ### Key Benefits
 * - Prevents unnecessary re-renders in child components
 * - Eliminates the need to include all dependencies in useCallback
 * - Avoids the complexity of managing refs manually
 * - Works seamlessly with React.memo and useMemo optimizations
 *
 * @example
 * ```typescript
 * // Problem: Stale closure in interval
 * const [count, setCount] = useState(0);
 * useEffect(() => {
 *   const id = setInterval(() => {
 *     console.log(count); // Always logs initial value
 *   }, 1000);
 *   return () => clearInterval(id);
 * }, []); // Empty deps = stale closure
 *
 * // Solution: Using useHandle
 * const [count, setCount] = useState(0);
 * const logCount = useHandle(() => {
 *   console.log(count); // Always logs current value
 * });
 * useEffect(() => {
 *   const id = setInterval(logCount, 1000);
 *   return () => clearInterval(id);
 * }, [logCount]); // logCount reference never changes
 *
 * // With memoized child components
 * const ExpensiveChild = React.memo(({ onClick }) => { ... });
 * const Parent = () => {
 *   const [data, setData] = useState(initialData);
 *
 *   // This would cause re-renders:
 *   // const handleClick = useCallback(() => process(data), [data]);
 *
 *   // This maintains stable reference:
 *   const handleClick = useHandle(() => process(data));
 *
 *   return <ExpensiveChild onClick={handleClick} />;
 * };
 *
 * // Optional handler support
 * const safeHandler = useHandle(props.onComplete);
 * // If props.onComplete is undefined, safeHandler returns null instead of throwing
 * ```
 *
 * @typeParam P - The array type of the handler's parameters
 * @typeParam R - The return type of the handler
 * @param handler - Optional function to be wrapped. If undefined, the returned function will return null
 * @returns A stable callback that always invokes the latest version of the handler
 */
export const useHandle = <P extends Array<any>, R>(
  handler?: (...args: P) => R,
): ((...args: P) => R) => {
  const handelRef = useReference(handler);
  return useCallback(
    (...args: P) => {
      if (typeof handelRef.current === 'function')
        return handelRef.current(...args);
      return null as never;
    },
    [handelRef],
  );
};
