/**
 * Configuration options for controlling function execution behavior in rate limiting utilities.
 * 
 * Provides fine-grained control over when and how functions execute in debounce and throttle
 * implementations. Supports leading/trailing execution modes and abort signal integration
 * for cancellation support.
 * 
 * @example
 * Basic usage with different execution modes:
 * ```typescript
 * // Execute only after delay (default debounce behavior)
 * const options1: ExecutionOptions = {
 *   leading: false,
 *   trailing: true
 * };
 * 
 * // Execute immediately, ignore subsequent calls during delay
 * const options2: ExecutionOptions = {
 *   leading: true,
 *   trailing: false
 * };
 * 
 * // Execute both immediately and after delay
 * const options3: ExecutionOptions = {
 *   leading: true,
 *   trailing: true
 * };
 * ```
 * 
 * @example
 * AbortSignal integration for cancellation:
 * ```typescript
 * const controller = new AbortController();
 * 
 * const options: ExecutionOptions = {
 *   signal: controller.signal,
 *   leading: true,
 *   trailing: true
 * };
 * 
 * const debouncedFn = debounce(myFunction, 500, options);
 * 
 * // Later, cancel all pending executions
 * controller.abort();
 * ```
 * 
 * @example
 * React component cleanup:
 * ```typescript
 * useEffect(() => {
 *   const controller = new AbortController();
 *   
 *   const debouncedSearch = debounce(searchAPI, 300, {
 *     signal: controller.signal,
 *     trailing: true
 *   });
 *   
 *   inputRef.current?.addEventListener('input', debouncedSearch);
 *   
 *   return () => {
 *     controller.abort(); // Cancel any pending searches
 *     inputRef.current?.removeEventListener('input', debouncedSearch);
 *   };
 * }, []);
 * ```
 */
export type ExecutionOptions = {
  /** 
   * AbortSignal to stop function execution and prevent future calls.
   * 
   * When the signal is aborted, all pending executions are cancelled
   * and future calls to the rate-limited function are ignored.
   * Useful for cleanup in React components or cancelling operations.
   * 
   * @example
   * ```typescript
   * const controller = new AbortController();
   * const throttled = throttle(fn, 1000, { signal: controller.signal });
   * 
   * // Cancel all pending operations
   * controller.abort();
   * ```
   */
  signal?: AbortSignal;
  
  /** 
   * Whether to execute the function immediately on the first call.
   * 
   * When true, the function executes immediately on the first invocation,
   * then subsequent calls within the time window are handled according
   * to trailing behavior. When false, all execution is delayed.
   * 
   * **Common Use Cases:**
   * - **true**: Button click protection, immediate user feedback
   * - **false**: Search inputs, form validation (wait for user to finish)
   * 
   * @default Varies by function (debounce: false, throttle: true)
   * 
   * @example
   * ```typescript
   * // Immediate execution, then ignore calls for 1 second
   * const clickHandler = debounce(handleClick, 1000, { leading: true, trailing: false });
   * 
   * // Wait for user to finish typing before searching
   * const searchHandler = debounce(search, 300, { leading: false, trailing: true });
   * ```
   */
  leading?: boolean;
  
  /** 
   * Whether to execute the function after the delay period when calls occurred.
   * 
   * When true, if calls are made during the delay period, the function
   * will execute once more after the delay expires. When false, only
   * leading execution (if enabled) occurs.
   * 
   * **Common Use Cases:**
   * - **true**: Ensure final execution with latest arguments (search, save)
   * - **false**: One-time execution only (button protection, immediate actions)
   * 
   * @default Varies by function (debounce: true, throttle: true)
   * 
   * @example
   * ```typescript
   * // Execute immediately, no trailing execution
   * const submitHandler = throttle(submitForm, 2000, { 
   *   leading: true, 
   *   trailing: false 
   * });
   * 
   * // Only trailing execution (classic debounce)
   * const saveHandler = debounce(autoSave, 1000, { 
   *   leading: false, 
   *   trailing: true 
   * });
   * ```
   */
  trailing?: boolean;
};
