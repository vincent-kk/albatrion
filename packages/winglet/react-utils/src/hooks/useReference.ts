import { useRef } from 'react';

/**
 * Returns a ref object that always references the current value.
 * The ref.current is automatically updated whenever the value changes.
 * Useful for accessing the latest value in callbacks without stale closure issues.
 * @typeParam T - The type of the value to reference
 * @param value - The value to reference
 * @returns A ref object that always contains the current value
 * @example
 * const callback = () => console.log(count);
 * const callbackRef = useReference(callback);
 * 
 * // Always logs the latest count value
 * useEffect(() => {
 *   const timer = setInterval(() => callbackRef.current(), 1000);
 *   return () => clearInterval(timer);
 * }, []);
 */
export const useReference = <T>(value: T) => {
  const reference = useRef<T>(value);
  reference.current = value;
  return reference;
};
