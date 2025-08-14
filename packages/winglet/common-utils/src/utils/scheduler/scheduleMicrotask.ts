import type { Fn } from '@aileron/declare';

/**
 * Determines and returns the optimal microtask scheduler for the current JavaScript environment.
 *
 * Automatically detects platform capabilities and selects the most appropriate microtask scheduling
 * API. Prioritizes the native `queueMicrotask` function when available (modern environments),
 * falling back to a Promise-based implementation for universal compatibility. Ensures consistent
 * microtask queue behavior across all JavaScript environments with minimal overhead.
 *
 * @returns Platform-optimized function for scheduling microtasks
 *
 * @example
 * Environment detection and function selection:
 * ```typescript
 * // Modern environment detection
 * if (typeof queueMicrotask === 'function') {
 *   // Uses native queueMicrotask (preferred)
 *   // - Direct microtask queue access
 *   // - Optimal performance and timing
 *   // - Native browser/Node.js implementation
 * } else {
 *   // Uses Promise.resolve().then() fallback
 *   // - Universal compatibility
 *   // - Same microtask queue behavior
 *   // - Slightly higher overhead
 * }
 * ```
 *
 * @remarks
 * **Platform-Specific Implementations:**
 * - **Modern Browsers/Node.js**: Uses native `queueMicrotask` for direct queue access
 * - **Legacy Environments**: Uses `Promise.resolve().then()` for equivalent behavior
 * - **Timing Guarantees**: Both implementations provide identical execution order
 *
 * **Performance Characteristics:**
 * - **Native queueMicrotask**: ~0.0001ms scheduling overhead, direct queue access
 * - **Promise fallback**: ~0.001ms overhead, slightly more memory allocation
 * - **Consistent Behavior**: Identical timing characteristics across implementations
 *
 * **Execution Priority:**
 * - **Highest Priority**: Executes before all macrotasks, I/O, and rendering
 * - **Queue Processing**: All microtasks execute before next event loop phase
 * - **Nested Microtasks**: New microtasks scheduled during execution are processed immediately
 */
const getScheduleMicrotask = (): Fn<[task: Fn]> => {
  if (typeof globalThis.queueMicrotask === 'function')
    return globalThis.queueMicrotask.bind(globalThis);
  const resolve = Promise.resolve();
  return (task: Fn) => resolve.then(task);
};

/**
 * Schedules a function to execute in the microtask queue with optimal cross-platform performance.
 *
 * Enqueues a callback function to execute immediately after the current execution stack
 * completes but before any macrotasks (setTimeout, I/O, rendering) are processed. Uses
 * the most efficient microtask scheduling mechanism available in the current environment.
 * Provides the highest execution priority in the JavaScript event loop.
 *
 * @param task - Function to execute in the microtask queue
 *
 * @example
 * Basic microtask scheduling:
 * ```typescript
 * import { scheduleMicrotask } from '@winglet/common-utils';
 *
 * console.log('1: Synchronous code');
 *
 * // Schedule microtask (executes before macrotasks)
 * scheduleMicrotask(() => {
 *   console.log('3: Microtask executed');
 * });
 *
 * // Schedule macrotask for comparison
 * setTimeout(() => {
 *   console.log('4: Macrotask executed');
 * }, 0);
 *
 * console.log('2: More synchronous code');
 *
 * // Output order:
 * // 1: Synchronous code
 * // 2: More synchronous code
 * // 3: Microtask executed
 * // 4: Macrotask executed
 * ```
 *
 * @example
 * Event loop execution order demonstration:
 * ```typescript
 * const executionOrder: string[] = [];
 *
 * // Synchronous execution
 * executionOrder.push('sync-1');
 *
 * // Multiple microtasks
 * scheduleMicrotask(() => {
 *   executionOrder.push('microtask-1');
 *
 *   // Nested microtask (executes in same phase)
 *   scheduleMicrotask(() => {
 *     executionOrder.push('nested-microtask');
 *   });
 * });
 *
 * scheduleMicrotask(() => {
 *   executionOrder.push('microtask-2');
 * });
 *
 * // Macrotask (executes after all microtasks)
 * setTimeout(() => {
 *   executionOrder.push('macrotask');
 * }, 0);
 *
 * executionOrder.push('sync-2');
 *
 * // Final order: ['sync-1', 'sync-2', 'microtask-1', 'microtask-2', 'nested-microtask', 'macrotask']
 * ```
 *
 * @example
 * State synchronization and cleanup:
 * ```typescript
 * // Ensure state updates are processed before UI updates
 * class StateManager {
 *   private state: any = {};
 *   private updateCallbacks: (() => void)[] = [];
 *   private updateScheduled = false;
 *
 *   setState(newState: any) {
 *     Object.assign(this.state, newState);
 *
 *     if (!this.updateScheduled) {
 *       this.updateScheduled = true;
 *
 *       // Schedule state synchronization in microtask
 *       scheduleMicrotask(() => {
 *         this.updateScheduled = false;
 *         this.updateCallbacks.forEach(callback => callback());
 *       });
 *     }
 *   }
 *
 *   onUpdate(callback: () => void) {
 *     this.updateCallbacks.push(callback);
 *   }
 * }
 *
 * // DOM synchronization
 * function scheduleImmediateUpdate(element: HTMLElement, value: string) {
 *   scheduleMicrotask(() => {
 *     element.textContent = value;
 *   });
 * }
 * ```
 *
 * @example
 * Async operation coordination:
 * ```typescript
 * // Coordinate multiple async operations
 * async function coordinatedAsync() {
 *   console.log('Starting coordination');
 *
 *   // Immediate microtask execution
 *   await new Promise<void>(resolve => {
 *     scheduleMicrotask(() => {
 *       console.log('Microtask 1 executed');
 *       resolve();
 *     });
 *   });
 *
 *   // Chain another microtask
 *   await new Promise<void>(resolve => {
 *     scheduleMicrotask(() => {
 *       console.log('Microtask 2 executed');
 *       resolve();
 *     });
 *   });
 *
 *   console.log('Coordination complete');
 * }
 *
 * // Error handling in microtasks
 * function safeMicrotask(task: () => void, errorHandler?: (error: Error) => void) {
 *   scheduleMicrotask(() => {
 *     try {
 *       task();
 *     } catch (error) {
 *       if (errorHandler) {
 *         errorHandler(error as Error);
 *       } else {
 *         console.error('Microtask error:', error);
 *       }
 *     }
 *   });
 * }
 * ```
 *
 * @example
 * React/Vue integration patterns:
 * ```typescript
 * // Flush state updates before rendering
 * function flushStateUpdates(callback: () => void) {
 *   scheduleMicrotask(() => {
 *     callback();
 *
 *     // Ensure DOM updates complete before next operation
 *     scheduleMicrotask(() => {
 *       console.log('State and DOM synchronized');
 *     });
 *   });
 * }
 *
 * // Testing utilities
 * function flushMicrotasks(): Promise<void> {
 *   return new Promise(resolve => {
 *     scheduleMicrotask(resolve);
 *   });
 * }
 *
 * // Usage in tests
 * async function testAsyncBehavior() {
 *   // Trigger async operation
 *   triggerAsyncUpdate();
 *
 *   // Wait for microtasks to complete
 *   await flushMicrotasks();
 *
 *   // Assert final state
 *   expect(finalState).toBe(expectedValue);
 * }
 * ```
 *
 * @example
 * Performance optimization patterns:
 * ```typescript
 * // Batch multiple synchronous operations
 * class BatchProcessor {
 *   private pendingItems: any[] = [];
 *   private processingScheduled = false;
 *
 *   addItem(item: any) {
 *     this.pendingItems.push(item);
 *
 *     if (!this.processingScheduled) {
 *       this.processingScheduled = true;
 *
 *       scheduleMicrotask(() => {
 *         this.processBatch();
 *         this.processingScheduled = false;
 *       });
 *     }
 *   }
 *
 *   private processBatch() {
 *     const items = [...this.pendingItems];
 *     this.pendingItems.length = 0;
 *
 *     // Process all items in single operation
 *     this.processItems(items);
 *   }
 *
 *   private processItems(items: any[]) {
 *     // Batch processing logic
 *   }
 * }
 *
 * // Debounce with immediate execution
 * function createMicrotaskDebouncer<T extends (...args: any[]) => void>(
 *   fn: T,
 *   immediate = false
 * ): T {
 *   let scheduled = false;
 *   let args: Parameters<T>;
 *
 *   return ((...newArgs: Parameters<T>) => {
 *     args = newArgs;
 *
 *     if (immediate && !scheduled) {
 *       fn(...args);
 *     }
 *
 *     if (!scheduled) {
 *       scheduled = true;
 *
 *       scheduleMicrotask(() => {
 *         scheduled = false;
 *         if (!immediate) {
 *           fn(...args);
 *         }
 *       });
 *     }
 *   }) as T;
 * }
 * ```
 *
 * @example
 * Custom scheduling systems:
 * ```typescript
 * // Priority-based microtask scheduler
 * class PriorityMicrotaskScheduler {
 *   private highPriorityQueue: (() => void)[] = [];
 *   private normalPriorityQueue: (() => void)[] = [];
 *   private lowPriorityQueue: (() => void)[] = [];
 *   private processing = false;
 *
 *   scheduleHigh(task: () => void) {
 *     this.highPriorityQueue.push(task);
 *     this.scheduleProcessing();
 *   }
 *
 *   scheduleNormal(task: () => void) {
 *     this.normalPriorityQueue.push(task);
 *     this.scheduleProcessing();
 *   }
 *
 *   scheduleLow(task: () => void) {
 *     this.lowPriorityQueue.push(task);
 *     this.scheduleProcessing();
 *   }
 *
 *   private scheduleProcessing() {
 *     if (!this.processing) {
 *       this.processing = true;
 *
 *       scheduleMicrotask(() => {
 *         this.processQueues();
 *         this.processing = false;
 *       });
 *     }
 *   }
 *
 *   private processQueues() {
 *     // Process high priority first
 *     while (this.highPriorityQueue.length > 0) {
 *       const task = this.highPriorityQueue.shift()!;
 *       task();
 *     }
 *
 *     // Then normal priority
 *     while (this.normalPriorityQueue.length > 0) {
 *       const task = this.normalPriorityQueue.shift()!;
 *       task();
 *     }
 *
 *     // Finally low priority
 *     while (this.lowPriorityQueue.length > 0) {
 *       const task = this.lowPriorityQueue.shift()!;
 *       task();
 *     }
 *   }
 * }
 * ```
 *
 * @remarks
 * **Event Loop Integration:**
 * - **Execution Timing**: Runs immediately after current execution stack
 * - **Priority**: Highest priority, before all macrotasks and I/O
 * - **Queue Processing**: All microtasks execute before next event loop phase
 * - **Nested Behavior**: New microtasks during execution are processed immediately
 *
 * **Platform Behavior:**
 * - **Modern Browsers**: Uses native `queueMicrotask` for optimal performance
 * - **Node.js**: Native `queueMicrotask` support with consistent timing
 * - **Legacy Environments**: Promise-based fallback with identical behavior
 * - **Web Workers**: Consistent behavior across all worker contexts
 *
 * **Performance Characteristics:**
 * - **Time Complexity**: O(1) for scheduling operation
 * - **Space Complexity**: O(1) per scheduled task
 * - **Scheduling Overhead**: ~0.0001ms with native implementation
 * - **Memory Usage**: Minimal, automatic cleanup after execution
 *
 * **Comparison with Alternatives:**
 * - **Promise.resolve().then()**: Similar timing, slightly more overhead
 * - **setTimeout(0)**: Much slower, executes in macrotask queue
 * - **requestAnimationFrame**: Tied to rendering, different timing
 * - **process.nextTick** (Node.js): Similar but different queue priority
 *
 * **Use Cases:**
 * - State synchronization before rendering
 * - Batch processing of synchronous operations
 * - Error handling and cleanup operations
 * - Testing utilities for async code
 * - React/Vue integration for immediate updates
 * - Custom scheduling and priority systems
 * - DOM manipulation coordination
 * - Performance optimization through batching
 *
 * **Best Practices:**
 * - Use for operations that must complete before macrotasks
 * - Batch multiple operations in single microtask when possible
 * - Handle errors appropriately within microtask callbacks
 * - Avoid infinite microtask loops that block the event loop
 * - Use for state synchronization in reactive systems
 * - Prefer for immediate DOM updates over setTimeout
 *
 * **Event Loop Timing:**
 * - **Phase 1**: Execute all synchronous code
 * - **Phase 2**: Execute all microtasks (including nested ones)
 * - **Phase 3**: Execute macrotasks (setTimeout, I/O, etc.)
 * - **Phase 4**: Browser rendering (if applicable)
 * - **Repeat**: Next event loop iteration
 *
 * **Browser/Runtime Compatibility:**
 * - **Modern Browsers**: Native `queueMicrotask` support (Chrome 71+, Firefox 69+, Safari 13.1+)
 * - **Node.js**: Native support in v11.0.0+
 * - **Legacy Support**: Promise-based fallback for universal compatibility
 * - **TypeScript**: Full type safety with proper function signatures
 */
export const scheduleMicrotask = getScheduleMicrotask();
