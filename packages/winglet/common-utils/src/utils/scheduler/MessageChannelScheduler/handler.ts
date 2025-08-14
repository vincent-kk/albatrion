import type { Fn } from '@aileron/declare';

import { MessageChannelScheduler } from './MessageChannelScheduler';

/** Cached global scheduler instance to minimize repeated instantiation overhead */
let globalScheduler: MessageChannelScheduler | null = null;

/**
 * Gets or creates the global scheduler instance with optimized caching.
 * Minimizes repeated instance checks and creation overhead by maintaining
 * a cached reference. Automatically recreates scheduler if previous instance
 * was destroyed.
 * 
 * @returns Active global MessageChannelScheduler instance
 * 
 * @example
 * ```typescript
 * // Internal usage - automatically called by public functions
 * const scheduler = ensureGlobalScheduler();
 * scheduler.schedule(myCallback);
 * ```
 * 
 * @remarks
 * **Performance Optimizations:**
 * - Caches scheduler reference to avoid repeated getInstance() calls
 * - Fast path for active scheduler with destroyed check
 * - Lazy recreation only when needed
 * - Single instance shared across all handler functions
 * 
 * **Lifecycle Management:**
 * - Creates new instance on first call
 * - Reuses cached instance for subsequent calls
 * - Automatically recreates if cached instance was destroyed
 * - Thread-safe for single-threaded JavaScript environment
 */
const ensureGlobalScheduler = (): MessageChannelScheduler => {
  if (globalScheduler?.destroyed === false) return globalScheduler;
  globalScheduler = MessageChannelScheduler.getInstance();
  return globalScheduler;
};

/**
 * Schedules a callback function for immediate macro task execution.
 * Provides a convenient global interface similar to Node.js setImmediate()
 * with optimized performance through cached scheduler reference.
 * 
 * @param callback - Function to execute in the next macro task
 * @returns Unique task ID for cancellation, or -1 if rejected
 * 
 * @example
 * Basic immediate execution:
 * ```typescript
 * const taskId = setImmediate(() => {
 *   console.log('Executed in next macro task');
 * });
 * 
 * // Cancel if needed
 * clearImmediate(taskId);
 * ```
 * 
 * @example
 * Batch processing with automatic optimization:
 * ```typescript
 * // These will be batched together automatically
 * setImmediate(() => updateUI());
 * setImmediate(() => processData());
 * setImmediate(() => logAnalytics());
 * ```
 * 
 * @remarks
 * **Performance Characteristics:**
 * - Hot path optimization with cached scheduler reference
 * - O(1) task scheduling with automatic batching
 * - Minimal function call overhead
 * - Efficient memory usage with shared scheduler instance
 * 
 * **Execution Timing:**
 * - Tasks execute in next macro task (after current call stack)
 * - Earlier than setTimeout(fn, 0) in most environments
 * - Automatic batching for tasks scheduled synchronously
 * - Preserves execution order within batches
 */
export const setImmediate = (callback: Fn): number =>
  ensureGlobalScheduler().schedule(callback);

/**
 * Cancels a previously scheduled immediate task by ID.
 * Provides fast cancellation with optimized early return paths
 * for invalid task IDs and edge cases.
 * 
 * @param taskId - ID returned from setImmediate() call
 * @returns true if task was found and cancelled, false otherwise
 * 
 * @example
 * Conditional task cancellation:
 * ```typescript
 * const taskId = setImmediate(() => {
 *   performExpensiveOperation();
 * });
 * 
 * // Cancel based on condition
 * if (shouldCancel) {
 *   const cancelled = clearImmediate(taskId);
 *   console.log(cancelled ? 'Task cancelled' : 'Task already executed');
 * }
 * ```
 * 
 * @example
 * Cleanup pattern:
 * ```typescript
 * let pendingTask: number;
 * 
 * function scheduleWork() {
 *   clearImmediate(pendingTask); // Safe to call with undefined
 *   pendingTask = setImmediate(doWork);
 * }
 * 
 * function cleanup() {
 *   clearImmediate(pendingTask);
 * }
 * ```
 * 
 * @remarks
 * **Fast Path Optimizations:**
 * - Early return for invalid task IDs (≤ 0)
 * - Single scheduler access for valid cancellation attempts
 * - O(1) task lookup and removal
 * - Safe to call multiple times with same ID
 * 
 * **Edge Case Handling:**
 * - Returns false for invalid task IDs (-1, 0, negative numbers)
 * - Handles already executed or cancelled tasks gracefully
 * - No exceptions thrown for any input values
 * - Idempotent operation - safe for repeated calls
 */
export const clearImmediate = (taskId: number): boolean => {
  if (taskId <= 0) return false;
  return ensureGlobalScheduler().cancel(taskId);
};

/**
 * Gets the current number of tasks waiting for execution.
 * Provides visibility into scheduler queue depth for monitoring
 * and debugging purposes.
 * 
 * @returns Count of pending tasks, or 0 if scheduler is destroyed
 * 
 * @example
 * Queue monitoring:
 * ```typescript
 * // Schedule some tasks
 * setImmediate(() => task1());
 * setImmediate(() => task2());
 * setImmediate(() => task3());
 * 
 * console.log(`Queue depth: ${getPendingCount()}`); // Output: Queue depth: 3
 * 
 * // After tasks execute
 * setImmediate(() => {
 *   console.log(`Queue depth: ${getPendingCount()}`); // Output: Queue depth: 0
 * });
 * ```
 * 
 * @example
 * Backpressure detection:
 * ```typescript
 * function scheduleWithBackpressure(callback: Function) {
 *   const queueDepth = getPendingCount();
 *   
 *   if (queueDepth > 100) {
 *     console.warn('High queue depth, consider throttling');
 *     return -1; // Reject new work
 *   }
 *   
 *   return setImmediate(callback);
 * }
 * ```
 * 
 * @remarks
 * **Use Cases:**
 * - Performance monitoring and queue depth tracking
 * - Implementing backpressure mechanisms
 * - Debugging task scheduling issues
 * - Load balancing decisions in complex applications
 * 
 * **Timing Considerations:**
 * - Count reflects tasks scheduled but not yet executed
 * - Value changes during batch execution cycles
 * - Returns 0 immediately after all tasks complete
 * - Accurate snapshot at time of call
 */
export const getPendingCount = (): number => {
  if (globalScheduler?.destroyed !== false) return 0;
  return globalScheduler.getPendingCount();
};

/**
 * Checks whether a specific task is currently pending execution.
 * Provides efficient lookup for task status verification with
 * optimized early return paths.
 * 
 * @param taskId - ID returned from setImmediate() call
 * @returns true if task is pending, false if executed, cancelled, or invalid
 * 
 * @example
 * Conditional logic based on task status:
 * ```typescript
 * const taskId = setImmediate(() => {
 *   performCriticalOperation();
 * });
 * 
 * // Later in code
 * if (isPending(taskId)) {
 *   console.log('Task still waiting to execute');
 * } else {
 *   console.log('Task completed or was cancelled');
 * }
 * ```
 * 
 * @example
 * Timeout pattern with task checking:
 * ```typescript
 * const taskId = setImmediate(() => {
 *   updateDatabase();
 * });
 * 
 * setTimeout(() => {
 *   if (isPending(taskId)) {
 *     console.warn('Database update is taking longer than expected');
 *     clearImmediate(taskId); // Cancel if too slow
 *   }
 * }, 5000);
 * ```
 * 
 * @remarks
 * **Performance Optimizations:**
 * - Early return for invalid task IDs (≤ 0)
 * - Single scheduler access for valid checks
 * - O(1) task lookup in internal Map
 * - No scheduler creation if destroyed
 * 
 * **Return Value Semantics:**
 * - `true`: Task exists and is waiting for execution
 * - `false`: Task ID invalid, already executed, cancelled, or scheduler destroyed
 * - No exceptions thrown for any input values
 * - Consistent behavior across all edge cases
 */
export const isPending = (taskId: number): boolean => {
  if (taskId <= 0 || globalScheduler?.destroyed !== false) return false;
  return globalScheduler.isPending(taskId);
};

/**
 * Cancels all pending tasks in the global scheduler queue.
 * Provides bulk cancellation with efficient batch operation
 * and returns count of affected tasks.
 * 
 * @returns Number of tasks that were cancelled
 * 
 * @example
 * Emergency cleanup:
 * ```typescript
 * // Schedule multiple tasks
 * setImmediate(() => task1());
 * setImmediate(() => task2());
 * setImmediate(() => task3());
 * 
 * // Emergency stop all pending work
 * const cancelled = cancelAll();
 * console.log(`Cancelled ${cancelled} pending tasks`);
 * ```
 * 
 * @example
 * Component cleanup pattern:
 * ```typescript
 * class TaskManager {
 *   private taskIds: number[] = [];
 *   
 *   scheduleTask(callback: Function) {
 *     const id = setImmediate(callback);
 *     this.taskIds.push(id);
 *     return id;
 *   }
 *   
 *   cleanup() {
 *     // Cancel all tasks from this manager
 *     const totalCancelled = cancelAll();
 *     this.taskIds = [];
 *     return totalCancelled;
 *   }
 * }
 * ```
 * 
 * @remarks
 * **Operation Characteristics:**
 * - Atomic operation - all tasks cancelled together
 * - O(1) bulk cancellation regardless of queue size
 * - Resets scheduler to idle state
 * - Memory efficient with immediate cleanup
 * 
 * **Use Cases:**
 * - Emergency stop scenarios
 * - Component unmounting cleanup
 * - Resource management in long-running applications
 * - Testing teardown procedures
 * 
 * **Side Effects:**
 * - All pending tasks are cancelled and will not execute
 * - Task callbacks become eligible for garbage collection
 * - Scheduler returns to idle state
 * - Subsequent tasks can be scheduled normally
 */
export const cancelAll = (): number => {
  if (globalScheduler?.destroyed !== false) return 0;
  return globalScheduler.cancelAll();
};

/**
 * Destroys the global scheduler and releases all associated resources.
 * Provides clean shutdown with proper resource cleanup and makes
 * operation idempotent for safe repeated calls.
 * 
 * @example
 * Application shutdown:
 * ```typescript
 * // During app cleanup
 * window.addEventListener('beforeunload', () => {
 *   destroyGlobalScheduler();
 * });
 * 
 * // Or in framework cleanup
 * useEffect(() => {
 *   return () => {
 *     destroyGlobalScheduler();
 *   };
 * }, []);
 * ```
 * 
 * @example
 * Test cleanup:
 * ```typescript
 * afterEach(() => {
 *   // Clean up between tests
 *   destroyGlobalScheduler();
 * });
 * 
 * afterAll(() => {
 *   // Final cleanup
 *   destroyGlobalScheduler();
 * });
 * ```
 * 
 * @remarks
 * **Resource Cleanup:**
 * - Cancels all pending tasks
 * - Closes MessageChannel ports
 * - Removes event listeners
 * - Clears all internal references
 * 
 * **Idempotent Operation:**
 * - Safe to call multiple times
 * - No exceptions on repeated calls
 * - Handles already destroyed state gracefully
 * - Consistent state after any number of calls
 * 
 * **Post-Destruction Behavior:**
 * - New scheduler will be created on next function call
 * - Previous task IDs become permanently invalid
 * - Memory used by old scheduler becomes eligible for GC
 * - Fresh start with new scheduler instance
 */
export const destroyGlobalScheduler = (): void => {
  if (globalScheduler?.destroyed === false) globalScheduler.destroy();
  globalScheduler = null;
};

/**
 * Checks whether the global scheduler exists and is currently active.
 * Provides status information for monitoring and conditional logic
 * without triggering scheduler creation.
 * 
 * @returns true if scheduler exists and is not destroyed, false otherwise
 * 
 * @example
 * Conditional scheduling:
 * ```typescript
 * function safeSchedule(callback: Function) {
 *   if (!isSchedulerActive()) {
 *     console.log('Creating new scheduler instance');
 *   }
 *   
 *   return setImmediate(callback);
 * }
 * ```
 * 
 * @example
 * Health check:
 * ```typescript
 * function getSystemStatus() {
 *   return {
 *     schedulerActive: isSchedulerActive(),
 *     pendingTasks: isSchedulerActive() ? getPendingCount() : 0,
 *     timestamp: Date.now()
 *   };
 * }
 * ```
 * 
 * @remarks
 * **Non-Intrusive Check:**
 * - Does not create scheduler if none exists
 * - Does not modify any state
 * - Fast read-only operation
 * - No side effects or resource allocation
 * 
 * **Use Cases:**
 * - System health monitoring
 * - Conditional logic before scheduling
 * - Debugging and diagnostics
 * - Resource management decisions
 * 
 * **Return Value Meanings:**
 * - `true`: Scheduler exists and can accept new tasks
 * - `false`: No scheduler or scheduler was destroyed
 * - Always reflects current state accurately
 * - Consistent with other function behaviors
 */
export const isSchedulerActive = (): boolean => {
  return globalScheduler?.destroyed === false;
};
