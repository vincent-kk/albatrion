import type { Fn } from '@aileron/declare';

/**
 * Interface for storing function execution context.
 * Maintains the execution environment including 'this' context and arguments
 * for deferred function calls in debounce and throttle implementations.
 * @template F - Function type to store context for
 */
interface ExecutionContext<F extends Fn<any[]>> {
  /** The 'this' context to be used when executing the function */
  self: any;
  /** Arguments to pass when calling the function */
  args: Parameters<F> | null;
}

/**
 * Class that manages function execution context and scheduling for rate limiting utilities.
 * 
 * Provides centralized management of function calls with delayed execution, context preservation,
 * and timer management. Used internally by debounce and throttle functions to maintain
 * execution state and handle complex timing scenarios. Ensures proper 'this' binding
 * and argument passing for deferred function calls.
 * 
 * @template F - Type of function to manage
 * 
 * @example
 * Internal usage in debounce/throttle:
 * ```typescript
 * // Inside debounce implementation
 * const context = new FunctionContext(originalFunction, 300);
 * 
 * const debouncedFn = function(...args) {
 *   context.setArguments(this, args);
 *   context.schedule(true); // Schedule with trailing execution
 *   
 *   if (shouldExecuteImmediately) {
 *     context.execute();
 *   }
 * };
 * ```
 * 
 * @example
 * Manual execution control:
 * ```typescript
 * const context = new FunctionContext(someFunction, 500);
 * 
 * // Set up execution context
 * context.setArguments(thisBinding, [arg1, arg2, arg3]);
 * 
 * // Schedule execution
 * context.schedule(true);
 * 
 * // Check if ready for immediate execution
 * if (context.isIdle) {
 *   context.execute(); // Execute immediately
 * }
 * 
 * // Force execution bypassing timer
 * context.manualExecute();
 * 
 * // Cancel everything
 * context.clear();
 * ```
 * 
 * @remarks
 * **Key Responsibilities:**
 * - **Context Preservation**: Maintains 'this' binding and arguments across async boundaries
 * - **Timer Management**: Handles setTimeout/clearTimeout for delayed execution
 * - **Execution Control**: Provides immediate, scheduled, and manual execution modes
 * - **State Tracking**: Tracks whether timer is active via `isIdle` property
 * - **Memory Management**: Cleans up references to prevent memory leaks
 * 
 * **Execution Modes:**
 * - **Scheduled**: Execute function after delay using setTimeout
 * - **Immediate**: Execute function right away with current context
 * - **Manual**: Force execution and clear timer immediately
 * - **Clear**: Cancel all pending execution and reset state
 * 
 * **Context Management:**
 * - Preserves exact 'this' binding from original call site
 * - Stores complete argument list for deferred execution
 * - Automatically clears context after execution to prevent stale references
 * - Handles edge cases like null/undefined contexts safely
 * 
 * **Timer Lifecycle:**
 * 1. Timer starts as null (idle state)
 * 2. `schedule()` creates setTimeout and stores timer ID
 * 3. Timer callback executes function and cleans up
 * 4. `clear()` or `manualExecute()` can interrupt this flow
 * 5. Context and timer are reset after execution or cancellation
 */
export class FunctionContext<F extends Fn<any[]>> {
  /** Function execution context including 'this' binding and arguments */
  private __context__: ExecutionContext<F>;
  /** Active timer ID from setTimeout, null when no timer is active */
  private __timer__: ReturnType<typeof setTimeout> | null = null;
  /** The function to manage and execute */
  private __function__: F;
  /** Execution delay time in milliseconds */
  private __delay__: number;

  /**
   * Whether there is no timer currently waiting for execution.
   * Used to determine if function can execute immediately (leading edge).
   * @returns true if no timer is active, false if timer is scheduled
   */
  public get isIdle() {
    return this.__timer__ === null;
  }

  /**
   * Creates a new FunctionContext for managing delayed function execution.
   * @param fn - Function to manage and execute
   * @param ms - Execution delay time in milliseconds
   */
  constructor(fn: F, ms: number) {
    this.__function__ = fn;
    this.__delay__ = ms;
    this.__context__ = {
      self: undefined,
      args: null,
    };
  }

  /**
   * Cancels any active timer and clears stored execution context.
   * Used for cleanup and preventing stale executions.
   */
  public clear() {
    this.__clearTimer__();
    this.__clearContext__();
  }

  /**
   * Stores the execution context for later use.
   * Preserves 'this' binding and arguments from the call site.
   * @param self - The 'this' context to be used when executing the function
   * @param args - Arguments to pass when calling the function
   */
  public setArguments(self: any, args: Parameters<F>) {
    this.__context__.self = self;
    this.__context__.args = args;
  }

  /**
   * Executes the function immediately with the stored context.
   * Clears the context after execution to prevent stale references.
   * Does nothing if no arguments have been set.
   */
  public execute() {
    if (this.__context__.args === null) return;
    this.__function__.apply(this.__context__.self, this.__context__.args);
    this.__clearContext__();
  }

  /**
   * Schedules function execution after the specified delay.
   * Cancels any existing timer before setting up new one.
   * @param execute - Whether to execute the function when timer completes
   */
  public schedule(execute?: boolean) {
    if (this.__timer__ !== null) clearTimeout(this.__timer__);
    const timer = setTimeout(() => {
      this.__timer__ = null;
      if (execute) this.execute();
      this.clear();
    }, this.__delay__);
    this.__timer__ = timer;
  }

  /**
   * Cancels any pending timer and executes the function immediately.
   * Combines immediate execution with timer cleanup for manual control.
   */
  public manualExecute() {
    this.execute();
    this.__clearTimer__();
  }

  /**
   * Resets the function execution context to initial state.
   * Clears 'this' binding and arguments to prevent memory leaks.
   * @private
   */
  private __clearContext__() {
    this.__context__.self = undefined;
    this.__context__.args = null;
  }

  /**
   * Cancels and clears the active timer if one exists.
   * Sets timer reference to null to indicate idle state.
   * @private
   */
  private __clearTimer__() {
    if (this.__timer__ === null) return;
    clearTimeout(this.__timer__);
    this.__timer__ = null;
  }
}
