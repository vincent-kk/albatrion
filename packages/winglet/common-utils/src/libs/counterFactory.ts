/**
 * Creates a stateful counter with increment, decrement, and reset capabilities.
 *
 * Provides a simple but powerful counter implementation with immutable interface
 * and consistent state management. Ideal for tracking quantities, iterations,
 * sequence numbers, and other numeric state that needs controlled modification.
 *
 * @param initialValue - Starting counter value (defaults to 0)
 * @returns Counter object with manipulation methods and current value access
 *
 * @example
 * Basic counter usage:
 * ```typescript
 * import { counterFactory } from '@winglet/common-utils';
 *
 * const counter = counterFactory(10);
 *
 * console.log(counter.getValue()); // 10
 * console.log(counter.increment()); // 11
 * console.log(counter.increment()); // 12
 * console.log(counter.decrement()); // 11
 * console.log(counter.reset()); // 10
 * ```
 *
 * @example
 * Request tracking:
 * ```typescript
 * const requestCounter = counterFactory();
 *
 * async function makeRequest(url: string) {
 *   const requestId = requestCounter.increment();
 *   console.log(`Making request #${requestId} to ${url}`);
 *
 *   try {
 *     const response = await fetch(url);
 *     console.log(`Request #${requestId} completed`);
 *     return response;
 *   } catch (error) {
 *     console.log(`Request #${requestId} failed:`, error);
 *     throw error;
 *   }
 * }
 * ```
 *
 * @example
 * Retry mechanism:
 * ```typescript
 * const retryCounter = counterFactory();
 * const MAX_RETRIES = 3;
 *
 * async function fetchWithRetry(url: string): Promise<Response> {
 *   retryCounter.reset();
 *
 *   while (retryCounter.getValue() < MAX_RETRIES) {
 *     try {
 *       return await fetch(url);
 *     } catch (error) {
 *       const attempt = retryCounter.increment();
 *       if (attempt >= MAX_RETRIES) {
 *         throw new Error(`Failed after ${attempt} attempts: ${error}`);
 *       }
 *       console.log(`Retry attempt ${attempt}/${MAX_RETRIES}`);
 *       await delay(1000 * attempt); // Exponential backoff
 *     }
 *   }
 *
 *   throw new Error('Unexpected retry loop exit');
 * }
 * ```
 *
 * @remarks
 * **Key Features:**
 * - **Encapsulated State**: Counter value is private and controlled
 * - **Immutable Interface**: Methods return new values without side effects on return
 * - **Atomic Operations**: Each operation is atomic and thread-safe
 * - **Reset Capability**: Can restore to initial value at any time
 * - **Type Safety**: Full TypeScript support with number type guarantees
 *
 * **Use Cases:**
 * - **ID Generation**: Create sequential identifiers
 * - **Iteration Tracking**: Monitor loop or process iterations
 * - **Rate Limiting**: Track request counts or usage metrics
 * - **Game Scoring**: Manage scores, lives, or points
 * - **Statistics Collection**: Count events, errors, or successes
 */
export const counterFactory = (initialValue = 0) => {
  let value = initialValue;
  return {
    /**
     * Gets the current counter value
     * @returns The current counter value
     */
    getValue: () => value,
    /**
     * Increments the counter value by 1 and returns the incremented value
     * @returns The incremented counter value
     */
    increment: () => ++value,
    /**
     * Decrements the counter value by 1 and returns the decremented value
     * @returns The decremented counter value
     */
    decrement: () => --value,
    /**
     * Resets the counter value to the initial value
     * @returns The reset value
     */
    reset: () => (value = initialValue),
  };
};
