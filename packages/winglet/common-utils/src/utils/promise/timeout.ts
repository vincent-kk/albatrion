import { TimeoutError } from '@/common-utils/errors/TimeoutError';
import { type DelayOptions, delay } from '@/common-utils/utils/promise/delay';

/**
 * Creates a Promise that rejects with a TimeoutError after a specified delay.
 *
 * Provides a clean way to implement timeout behavior in Promise-based operations.
 * Perfect for creating timeout conditions in Promise.race scenarios, implementing
 * deadline-based operations, and building timeout utilities. Leverages the delay
 * function internally to ensure consistent timing and abort signal support.
 *
 * @param ms - Timeout duration in milliseconds (default: 0)
 * @param options - Configuration options for timeout behavior
 * @param options.signal - AbortSignal to cancel the timeout before it fires
 * @returns Promise that always rejects with TimeoutError after the specified delay
 *
 * @throws {TimeoutError} Always thrown after the specified delay
 * @throws {AbortError} When canceled via AbortSignal before timeout fires
 *
 * @example
 * Basic timeout usage:
 * ```typescript
 * import { timeout } from '@winglet/common-utils';
 *
 * try {
 *   // Will always throw TimeoutError after 5 seconds
 *   await timeout(5000);
 * } catch (error) {
 *   if (error instanceof TimeoutError) {
 *     console.log('Timeout occurred:', error.message); // "Timeout after 5000ms"
 *     console.log('Delay info:', error.extra.delay);   // 5000
 *   }
 * }
 * ```
 *
 * @example
 * Creating timeout conditions with Promise.race:
 * ```typescript
 * async function fetchWithTimeout(url: string, timeoutMs: number) {
 *   try {
 *     const result = await Promise.race([
 *       fetch(url).then(r => r.json()),
 *       timeout(timeoutMs) // This will throw if fetch takes too long
 *     ]);
 *
 *     return result;
 *   } catch (error) {
 *     if (error instanceof TimeoutError) {
 *       throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
 *     }
 *     throw error; // Re-throw fetch errors
 *   }
 * }
 *
 * // Usage
 * try {
 *   const data = await fetchWithTimeout('/api/slow-endpoint', 3000);
 *   console.log('Data received:', data);
 * } catch (error) {
 *   console.error('Request failed:', error.message);
 * }
 * ```
 *
 * @example
 * User interaction timeout:
 * ```typescript
 * async function waitForUserAction(timeoutMs: number = 30000) {
 *   return new Promise((resolve, reject) => {
 *     let actionReceived = false;
 *
 *     // Setup user action handler
 *     const handleAction = (event: Event) => {
 *       if (!actionReceived) {
 *         actionReceived = true;
 *         document.removeEventListener('click', handleAction);
 *         resolve(event);
 *       }
 *     };
 *
 *     document.addEventListener('click', handleAction);
 *
 *     // Setup timeout
 *     timeout(timeoutMs).catch(error => {
 *       if (!actionReceived) {
 *         actionReceived = true;
 *         document.removeEventListener('click', handleAction);
 *         reject(error);
 *       }
 *     });
 *   });
 * }
 *
 * // Usage
 * try {
 *   const clickEvent = await waitForUserAction(10000);
 *   console.log('User clicked:', clickEvent);
 * } catch (error) {
 *   if (error instanceof TimeoutError) {
 *     console.log('User did not interact within 10 seconds');
 *   }
 * }
 * ```
 *
 * @example
 * Operation deadline enforcement:
 * ```typescript
 * async function processWithDeadline<T>(
 *   operation: () => Promise<T>,
 *   deadlineMs: number
 * ): Promise<T> {
 *   const startTime = Date.now();
 *
 *   try {
 *     return await Promise.race([
 *       operation(),
 *       timeout(deadlineMs)
 *     ]);
 *   } catch (error) {
 *     const elapsed = Date.now() - startTime;
 *
 *     if (error instanceof TimeoutError) {
 *       throw new Error(
 *         `Operation exceeded deadline of ${deadlineMs}ms (took ${elapsed}ms)`
 *       );
 *     }
 *
 *     throw error;
 *   }
 * }
 *
 * // Usage with file processing
 * try {
 *   const result = await processWithDeadline(
 *     () => processLargeFile('data.csv'),
 *     60000 // 1 minute deadline
 *   );
 *   console.log('File processed successfully:', result);
 * } catch (error) {
 *   console.error('Processing failed or exceeded deadline:', error.message);
 * }
 * ```
 *
 * @example
 * Cancellable timeout with AbortSignal:
 * ```typescript
 * async function cancellableTimeout() {
 *   const controller = new AbortController();
 *
 *   // Cancel timeout if user performs action
 *   document.addEventListener('keypress', () => {
 *     console.log('User activity detected, cancelling timeout');
 *     controller.abort();
 *   }, { once: true });
 *
 *   try {
 *     await timeout(5000, { signal: controller.signal });
 *     console.log('This should not execute if user presses a key');
 *   } catch (error) {
 *     if (error instanceof AbortError) {
 *       console.log('Timeout was cancelled:', error.message);
 *     } else if (error instanceof TimeoutError) {
 *       console.log('Timeout completed - no user activity detected');
 *     }
 *   }
 * }
 * ```
 *
 * @example
 * Building a timeout utility class:
 * ```typescript
 * class TimeoutManager {
 *   private timeouts = new Map<string, AbortController>();
 *
 *   async createTimeout(id: string, ms: number): Promise<never> {
 *     // Cancel existing timeout with same ID
 *     this.cancel(id);
 *
 *     const controller = new AbortController();
 *     this.timeouts.set(id, controller);
 *
 *     try {
 *       return await timeout(ms, { signal: controller.signal });
 *     } finally {
 *       this.timeouts.delete(id);
 *     }
 *   }
 *
 *   cancel(id: string): boolean {
 *     const controller = this.timeouts.get(id);
 *     if (controller) {
 *       controller.abort();
 *       this.timeouts.delete(id);
 *       return true;
 *     }
 *     return false;
 *   }
 *
 *   cancelAll(): void {
 *     for (const controller of this.timeouts.values()) {
 *       controller.abort();
 *     }
 *     this.timeouts.clear();
 *   }
 * }
 *
 * // Usage
 * const timeoutManager = new TimeoutManager();
 *
 * // Create named timeouts
 * timeout Manager.createTimeout('user-session', 1800000) // 30 min session
 *   .catch(error => {
 *     if (error instanceof TimeoutError) {
 *       console.log('User session expired');
 *       redirectToLogin();
 *     }
 *   });
 *
 * // Cancel specific timeout
 * userActivity$.subscribe(() => {
 *   timeoutManager.cancel('user-session');
 *   // Restart session timeout
 *   timeoutManager.createTimeout('user-session', 1800000);
 * });
 * ```
 *
 * @example
 * Testing timeout scenarios:
 * ```typescript
 * describe('Timeout behavior', () => {
 *   it('should timeout after specified duration', async () => {
 *     const start = Date.now();
 *
 *     await expect(timeout(100)).rejects.toThrow('Timeout after 100ms');
 *
 *     const elapsed = Date.now() - start;
 *     expect(elapsed).toBeGreaterThanOrEqual(100);
 *     expect(elapsed).toBeLessThan(150); // Allow some variance
 *   });
 *
 *   it('should include delay information in error', async () => {
 *     try {
 *       await timeout(250);
 *       fail('Should have thrown TimeoutError');
 *     } catch (error) {
 *       expect(error).toBeInstanceOf(TimeoutError);
 *       expect(error.message).toBe('Timeout after 250ms');
 *       expect(error.extra.delay).toBe(250);
 *     }
 *   });
 *
 *   it('should be cancellable with AbortSignal', async () => {
 *     const controller = new AbortController();
 *
 *     setTimeout(() => controller.abort(), 50);
 *
 *     await expect(
 *       timeout(100, { signal: controller.signal })
 *     ).rejects.toThrow('Abort signal received');
 *   });
 * });
 * ```
 *
 * @remarks
 * **Key Features:**
 * - **Guaranteed Rejection**: Always throws TimeoutError after specified delay
 * - **Detailed Error Info**: TimeoutError includes original delay value in extra data
 * - **Cancellation Support**: Full AbortSignal integration via underlying delay function
 * - **Consistent Timing**: Uses same delay mechanism as other promise utilities
 * - **Race Condition Safe**: Designed for use with Promise.race scenarios
 *
 * **Error Types:**
 * - **TimeoutError**: Thrown when timeout duration elapses normally
 * - **AbortError**: Thrown when cancelled via AbortSignal before timeout
 *
 * **Common Patterns:**
 * - **Promise.race**: Combined with async operations to enforce time limits
 * - **Deadline Enforcement**: Set maximum execution time for operations
 * - **User Interaction**: Wait for user actions with timeout fallback
 * - **Session Management**: Implement automatic session expiration
 * - **Resource Cleanup**: Trigger cleanup operations after delays
 *
 * **Best Practices:**
 * - Always handle TimeoutError specifically in catch blocks
 * - Use meaningful timeout values based on expected operation duration
 * - Consider user experience when setting timeout durations
 * - Provide clear feedback when operations timeout
 * - Use AbortSignal for cancellation in interactive scenarios
 *
 * **Performance Considerations:**
 * - **Memory Usage**: ~50-90 bytes per timeout (inherits from delay + error object)
 * - **CPU Overhead**: <0.2ms for timeout setup and error creation
 * - **Timing Precision**:
 *   - Browser: ±1-4ms accuracy (subject to background tab throttling)
 *   - Node.js: ±1ms accuracy (more reliable for precise timeouts)
 *   - Minimum timeout: 1ms (0ms timeouts fire immediately)
 * - **Environment Differences**:
 *   - **Browser**: Throttled in background tabs (1000ms max), affected by system performance
 *   - **Node.js**: Consistent timing, not affected by UI thread blocking
 *   - **Web Workers**: Full precision maintained, not throttled
 * - **Error Object Size**: TimeoutError ~200-300 bytes including stack trace
 * - **Cleanup Efficiency**: Automatic via delay function's AbortSignal integration
 */
export const timeout = async (
  ms = 0,
  options?: DelayOptions,
): Promise<never> => {
  await delay(ms, options);
  throw new TimeoutError('AFTER_DELAY', `Timeout after ${ms}ms`, { delay: ms });
};
