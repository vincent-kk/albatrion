import { useRef } from 'react';

import type { Fn } from '@aileron/declare';

import { useCommittedReference } from './utils/useCommittedReference';

/**
 * Creates a stable callback reference that always invokes the latest committed version of the provided handler.
 *
 * This hook solves the common "stale closure" problem in React by maintaining a stable
 * function reference while ensuring it always calls the most recent committed version of your handler.
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
 * - **Debounced/Throttled Functions**: Maintain stable references while using fresh data
 *
 * @example
 * ```typescript
 * // Stale closure in an interval, solved
 * const [count, setCount] = useState(0);
 * const logCount = useHandle(() => console.log(count)); // always the current count
 * useEffect(() => {
 *   const id = setInterval(logCount, 1000);
 *   return () => clearInterval(id);
 * }, [logCount]); // logCount identity never changes
 *
 * // Stable reference for a memoized child
 * const ExpensiveChild = React.memo(({ onClick }) => { ... });
 * const handleClick = useHandle(() => process(data));
 * return <ExpensiveChild onClick={handleClick} />;
 * ```
 *
 * @remarks React 18 and 19 publish handlers before layout effects. React 16.14 and 17
 * publish during the parent layout effect, so a child layout effect may read the prior commit.
 * Render attempts that suspend, throw, or are abandoned never replace the handler.
 *
 * @typeParam P - The array type of the handler's parameters
 * @typeParam R - The return type of the handler
 * @param handler - The function to wrap
 * @returns A stable callback that always invokes the latest committed version of the handler
 */
export function useHandle<P extends Array<any>, R>(handler: Fn<P, R>): Fn<P, R>;
/**
 * Wraps an optional handler in a stable callback.
 *
 * When no handler is available at call time the returned callback performs no work and
 * yields `null`, so an absent handler never throws — which is why the result type widens
 * to `R | null` for this overload.
 *
 * @example
 * ```typescript
 * const safeHandler = useHandle(props.onComplete);
 * const result = safeHandler(); // null while props.onComplete is undefined
 * ```
 *
 * @typeParam P - The array type of the handler's parameters
 * @typeParam R - The return type of the handler
 * @param handler - Optional function to wrap
 * @returns A stable callback that invokes the latest handler, or yields `null` when there is none
 */
export function useHandle<P extends Array<any>, R>(
  handler?: Fn<P, R>,
): Fn<P, R | null>;
export function useHandle<P extends Array<any>, R>(
  handler?: Fn<P, R>,
): Fn<P, R | null> {
  type HandlerReference = { current: typeof handler; handle: Fn<P, R | null> };
  const holder = useRef<HandlerReference | null>(null);
  if (holder.current === null) {
    const reference: HandlerReference = {
      current: handler,
      handle: (...args: P) => {
        const latest = reference.current;
        return typeof latest === 'function' ? latest(...args) : null;
      },
    };
    holder.current = reference;
  }
  return useCommittedReference(holder.current, handler).handle;
}
