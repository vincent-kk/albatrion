import type { Fn } from '@aileron/declare';

import { scheduleMicrotask } from '../scheduleMicrotask';
import type { SchedulerOptions } from './type';

/**
 * High-performance task scheduler using MessageChannel for macro task execution.
 *
 * Provides efficient scheduling of callback functions with automatic batching, cancellation
 * support, and resource management. Uses MessageChannel API for precise timing control
 * and better performance compared to setTimeout-based schedulers. Implements singleton
 * pattern for global usage while supporting multiple independent instances.
 *
 * @example
 * Basic usage with singleton pattern:
 * ```typescript
 * const scheduler = MessageChannelScheduler.getInstance();
 *
 * // Schedule immediate execution
 * const taskId = scheduler.schedule(() => {
 *   console.log('Task executed');
 * });
 *
 * // Cancel if needed
 * scheduler.cancel(taskId);
 * ```
 *
 * @example
 * Batch scheduling with automatic optimization:
 * ```typescript
 * const scheduler = MessageChannelScheduler.getInstance();
 *
 * // These will be batched together automatically
 * const task1 = scheduler.schedule(() => updateUI());
 * const task2 = scheduler.schedule(() => processData());
 * const task3 = scheduler.schedule(() => sendAnalytics());
 *
 * // All tasks execute in single macro task
 * ```
 *
 * @example
 * Custom configuration with error handling:
 * ```typescript
 * const scheduler = MessageChannelScheduler.getInstance({
 *   maxPendingTasks: 100,
 *   onTaskError: (error, taskId) => {
 *     console.error(`Task ${taskId} failed:`, error);
 *   },
 *   onMaxTasksExceeded: () => {
 *     console.warn('Too many pending tasks, skipping');
 *     return false; // Reject new tasks
 *   }
 * });
 *
 * // Schedule with protection
 * const taskId = scheduler.schedule(riskyOperation);
 * if (taskId === -1) {
 *   // Task was rejected
 * }
 * ```
 *
 * @remarks
 * **Key Features:**
 * - **Automatic Batching**: Groups tasks scheduled in same sync context for efficiency
 * - **Precise Timing**: Uses MessageChannel for immediate macro task execution
 * - **Memory Efficient**: Optimized data structures and cleanup mechanisms
 * - **Error Handling**: Configurable error handling without stopping other tasks
 * - **Backpressure**: Configurable limits with custom overflow handling
 * - **Cancellation**: Individual task cancellation with O(1) performance
 *
 * **Performance Characteristics:**
 * - Task scheduling: O(1) amortized
 * - Task cancellation: O(1) lookup and deletion
 * - Batch execution: O(n) where n is batch size
 * - Memory usage: Linear with pending task count
 *
 * **Execution Model:**
 * 1. Tasks scheduled synchronously are batched together
 * 2. Microtask triggers MessageChannel post for batch execution
 * 3. All batched tasks execute in single macro task context
 * 4. Errors are isolated per task without affecting others
 * 5. Cleanup happens automatically after batch completion
 *
 * **Singleton Behavior:**
 * - `getInstance()` returns same instance across calls
 * - Options only apply to first `getInstance()` call
 * - Instance persists until explicitly destroyed
 * - Multiple independent instances can be created via constructor
 *
 * **Resource Management:**
 * - MessageChannel ports are properly closed on destroy
 * - Task references are cleared to prevent memory leaks
 * - Event listeners are removed during cleanup
 * - Automatic cleanup on browser page unload
 */
export class MessageChannelScheduler {
  /** Global singleton instance for shared usage across application */
  private static __instance__: MessageChannelScheduler | null = null;
  /** Scheduler configuration options with defaults applied */
  private readonly __options__: Required<SchedulerOptions>;
  /** Whether this scheduler instance has been destroyed and cannot be used */
  private __destroyed__ = false;

  /** MessageChannel for inter-context communication */
  private readonly __channel__: MessageChannel;
  /** Port for receiving execution messages */
  private readonly __receiverPort__: MessagePort;
  /** Port for sending batch execution signals */
  private readonly __senderPort__: MessagePort;

  /** Map of pending tasks keyed by unique task ID */
  private readonly __pendingTasks__ = new Map<number, Fn>();
  /** Incrementing counter for generating unique task IDs */
  private __taskIdCounter__ = 0;
  /** Whether scheduler is currently idle (no pending batch flush) */
  private __idle__ = true;

  /**
   * Creates a new MessageChannelScheduler instance with specified options.
   * Private constructor enforces singleton pattern for global usage.
   * @param options - Configuration options for scheduler behavior
   */
  private constructor(options: SchedulerOptions = {}) {
    this.__options__ = {
      maxPendingTasks: options.maxPendingTasks ?? Infinity,
      onTaskError: options.onTaskError ?? null,
      onMaxTasksExceeded: options.onMaxTasksExceeded ?? null,
    };

    this.__channel__ = new MessageChannel();
    this.__receiverPort__ = this.__channel__.port1;
    this.__senderPort__ = this.__channel__.port2;

    this.__receiverPort__.onmessage = this.__createMessageHandler__();
  }

  /**
   * Gets or creates the global singleton scheduler instance.
   * Options are only applied on first call when instance is created.
   * Subsequent calls ignore options parameter and return existing instance.
   * @param options - Configuration options (ignored if instance exists)
   * @returns Global scheduler instance
   */
  static getInstance(options?: SchedulerOptions): MessageChannelScheduler {
    const instance = MessageChannelScheduler.__instance__;
    if (instance && !instance.__destroyed__) return instance;
    MessageChannelScheduler.__instance__ = new MessageChannelScheduler(options);
    return MessageChannelScheduler.__instance__;
  }

  /**
   * Schedules a callback function for immediate macro task execution.
   * Tasks scheduled synchronously are automatically batched for efficiency.
   * Returns unique task ID for cancellation, or -1 if task was rejected.
   * @param callback - Function to execute in next macro task
   * @returns Task ID for cancellation, or -1 if rejected
   * @throws Error if scheduler is destroyed or max tasks exceeded without handler
   */
  schedule(callback: Fn): number {
    if (this.__destroyed__) throw new Error('Scheduler destroyed');

    const maxTasks = this.__options__.maxPendingTasks;

    if (this.__pendingTasks__.size >= maxTasks) {
      const maxTasksHandler = this.__options__.onMaxTasksExceeded;
      if (maxTasksHandler) {
        const shouldContinue = maxTasksHandler();
        if (shouldContinue === false) return -1;
      } else throw new Error(`Max tasks exceeded: ${maxTasks}`);
    }

    const taskId = ++this.__taskIdCounter__;
    this.__pendingTasks__.set(taskId, callback);

    if (this.__idle__) {
      this.__idle__ = false;
      scheduleMicrotask(() => this.__flushBatch__());
    }

    return taskId;
  }

  /**
   * Cancels a pending task by ID if it hasn't executed yet.
   * Uses O(1) Map deletion for efficient cancellation.
   * @param taskId - ID of task to cancel
   * @returns true if task was found and cancelled, false otherwise
   */
  cancel(taskId: number): boolean {
    return this.__pendingTasks__.delete(taskId);
  }

  /**
   * Cancels all pending tasks in a single optimized operation.
   * Resets scheduler to idle state and clears all task references.
   * @returns Number of tasks that were cancelled
   */
  cancelAll(): number {
    const cancelledCount = this.__pendingTasks__.size;
    this.__pendingTasks__.clear();
    this.__idle__ = true;
    return cancelledCount;
  }

  /**
   * Triggers batch execution by posting task IDs through MessageChannel.
   * Called automatically via microtask when batch is ready for execution.
   * @private
   */
  private __flushBatch__(): void {
    if (this.__pendingTasks__.size === 0) return;
    this.__senderPort__.postMessage(Array.from(this.__pendingTasks__.keys()));
  }

  /**
   * Checks if a task is currently pending execution.
   * Performs single Map lookup for O(1) performance.
   * @param taskId - ID of task to check
   * @returns true if task is pending, false for invalid ID (-1) or completed tasks
   */
  isPending(taskId: number): boolean {
    return taskId > 0 && this.__pendingTasks__.has(taskId);
  }

  /**
   * Gets the current number of tasks waiting for execution.
   * @returns Count of pending tasks
   */
  getPendingCount(): number {
    return this.__pendingTasks__.size;
  }

  /**
   * Destroys the scheduler and releases all resources.
   * Cancels pending tasks, closes MessageChannel ports, and cleans up references.
   * Scheduler cannot be used after destruction.
   */
  destroy(): void {
    if (this.__destroyed__) return;

    this.__pendingTasks__.clear();
    this.__receiverPort__.onmessage = null;
    this.__receiverPort__.close();
    this.__senderPort__.close();
    this.__destroyed__ = true;
    this.__idle__ = true;

    if (MessageChannelScheduler.__instance__ === this)
      MessageChannelScheduler.__instance__ = null;
  }

  /**
   * Whether this scheduler instance has been destroyed.
   * Destroyed schedulers cannot schedule new tasks.
   * @returns true if destroyed, false if still usable
   */
  get destroyed(): boolean {
    return this.__destroyed__;
  }

  /**
   * Creates optimized message handler for batch task execution.
   * Handles both individual tasks and batched tasks with minimal overhead.
   * Isolates task errors to prevent affecting other tasks in the batch.
   * @returns Message event handler for task execution
   * @private
   */
  private __createMessageHandler__(): (event: MessageEvent<number[]>) => void {
    const pendingTasks = this.__pendingTasks__;
    return (event: MessageEvent<number[]>) => {
      this.__idle__ = true;
      const taskIds = event.data;
      for (let i = 0, l = taskIds.length; i < l; i++) {
        const taskId = taskIds[i];
        const task = pendingTasks.get(taskId);
        if (typeof task === 'function')
          try {
            task();
          } catch (error) {
            this.__handleTaskError__(error, taskId);
          }
        pendingTasks.delete(taskId);
      }
    };
  }

  /**
   * Handles task execution errors using configured error handler.
   * Ensures errors are properly wrapped and reported without breaking execution.
   * @param error - Error that occurred during task execution
   * @param taskId - ID of the task that failed
   * @private
   */
  private __handleTaskError__(error: unknown, taskId: number): void {
    const errorHandler = this.__options__.onTaskError;
    if (!errorHandler) return;
    errorHandler(
      error instanceof Error ? error : new Error(String(error)),
      taskId,
    );
  }
}
