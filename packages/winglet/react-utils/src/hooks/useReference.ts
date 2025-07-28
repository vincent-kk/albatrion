import { useRef } from 'react';

/**
 * Creates a ref that always contains the current value, updating automatically on every render.
 *
 * This hook solves the "stale closure" problem by ensuring that async callbacks, effects,
 * and event handlers always have access to the latest value without needing to recreate
 * themselves. Unlike a regular `useRef`, this ref's current value is updated on every
 * render to match the provided value.
 *
 * ### Problem it Solves
 * When callbacks are created in React, they capture values from their closure. If these
 * values change later, the callback still sees the old values. This hook ensures you
 * always have access to the current value without recreating callbacks.
 *
 * ### Use Cases
 * - **Async Callbacks**: Access current state in setTimeout/setInterval callbacks
 * - **Event Handlers**: Use latest props/state in debounced or throttled handlers
 * - **Effect Cleanup**: Access current values in cleanup functions
 * - **Imperative Handles**: Expose methods that use current component state
 * - **External Library Callbacks**: Provide callbacks to non-React code
 *
 * ### Comparison with Alternatives
 * - **vs useRef**: This updates automatically; useRef requires manual updates
 * - **vs useState**: This doesn't trigger re-renders when updated
 * - **vs useCallback deps**: This avoids recreating callbacks when values change
 *
 * @example
 * ```typescript
 * // Problem: Stale state in async callback
 * const [count, setCount] = useState(0);
 * const handleAsync = useCallback(async () => {
 *   await delay(1000);
 *   console.log(count); // Always logs 0, even if count changed
 * }, []); // Can't add count to deps or callback recreates
 *
 * // Solution: Using useReference
 * const [count, setCount] = useState(0);
 * const countRef = useReference(count);
 * const handleAsync = useCallback(async () => {
 *   await delay(1000);
 *   console.log(countRef.current); // Always logs current count
 * }, [countRef]); // countRef never changes, so callback is stable
 *
 * // Access current props in cleanup
 * const connectionRef = useReference(props.connection);
 * useEffect(() => {
 *   const ws = new WebSocket(url);
 *
 *   return () => {
 *     // Access current connection state during cleanup
 *     if (connectionRef.current.shouldNotify) {
 *       notifyDisconnection();
 *     }
 *     ws.close();
 *   };
 * }, [url, connectionRef]);
 *
 * // Debounced handler with current values
 * const searchTerm = useReference(inputValue);
 * const debouncedSearch = useMemo(
 *   () => debounce(() => {
 *     // Always searches with current term
 *     search(searchTerm.current);
 *   }, 500),
 *   [searchTerm]
 * );
 *
 * // Imperative handle with current state
 * const [items, setItems] = useState([]);
 * const itemsRef = useReference(items);
 *
 * useImperativeHandle(ref, () => ({
 *   getItemCount: () => itemsRef.current.length,
 *   hasItems: () => itemsRef.current.length > 0,
 * }), [itemsRef]);
 * ```
 *
 * @typeParam T - The type of the value to keep current reference to
 * @param value - The value to track. The ref will always contain this latest value
 * @returns A ref object whose `current` property always equals the latest `value`
 */
export const useReference = <T>(value: T) => {
  const reference = useRef<T>(value);
  reference.current = value;
  return reference;
};
