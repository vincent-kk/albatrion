import { type EffectCallback, useEffect } from 'react';

/**
 * Executes a side effect only once when the component mounts.
 *
 * This hook provides a semantic way to run initialization logic that should only
 * execute once during the component's lifecycle. It's equivalent to `useEffect`
 * with an empty dependency array but with clearer intent.
 *
 * ### Use Cases
 * - **Data Fetching**: Load initial data when component first renders
 * - **Event Listener Setup**: Attach global event listeners or subscriptions
 * - **Third-party Library Initialization**: Initialize external libraries or SDKs
 * - **Animation Triggers**: Start animations when component enters the DOM
 * - **Analytics Tracking**: Track page views or component usage
 *
 * ### Cleanup Support
 * The handler can return a cleanup function that will be called when the
 * component unmounts, making it perfect for managing resources.
 *
 * @example
 * ```typescript
 * // Simple initialization
 * useOnMount(() => {
 *   console.log('Component mounted!');
 *   trackEvent('ComponentView', { name: 'UserProfile' });
 * });
 *
 * // With cleanup
 * useOnMount(() => {
 *   const controller = new AbortController();
 *
 *   fetchUserData({ signal: controller.signal })
 *     .then(data => setUser(data))
 *     .catch(err => {
 *       if (!controller.signal.aborted) {
 *         setError(err);
 *       }
 *     });
 *
 *   return () => controller.abort();
 * });
 *
 * // Event listener with cleanup
 * useOnMount(() => {
 *   const handleKeyPress = (e: KeyboardEvent) => {
 *     if (e.key === 'Escape') closeModal();
 *   };
 *
 *   document.addEventListener('keydown', handleKeyPress);
 *   return () => document.removeEventListener('keydown', handleKeyPress);
 * });
 *
 * // WebSocket connection
 * useOnMount(() => {
 *   const ws = new WebSocket('wss://api.example.com');
 *
 *   ws.onmessage = (event) => {
 *     handleMessage(JSON.parse(event.data));
 *   };
 *
 *   ws.onopen = () => setConnected(true);
 *   ws.onclose = () => setConnected(false);
 *
 *   return () => ws.close();
 * });
 * ```
 *
 * @param handler - The effect function to execute on mount. Can return a cleanup function
 */
export const useOnMount = (handler: EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(handler, []);
};
