import type { Fn } from '@aileron/declare';

/**
 * Interface for storing function execution context
 * @template F - Function type
 */
interface ExecutionContext<F extends Fn<any[]>> {
  /** The 'this' context to be used when executing the function */
  self: any;
  /** Arguments to pass when calling the function */
  args: Parameters<F> | null;
}

/**
 * Class that manages and schedules function execution
 * Used in debounce and throttle implementations
 * @template F - Type of function to manage
 */
export class FunctionContext<F extends Fn<any[]>> {
  /** Function execution context */
  #context: ExecutionContext<F>;
  /** Timer ID */
  #timer: ReturnType<typeof setTimeout> | null = null;
  /** Function to manage */
  #function: F;
  /** Execution delay time in milliseconds */
  #delay: number;

  /**
   * Whether there is no timer currently waiting for execution
   * @returns true if there is no timer, false if there is
   */
  get isIdle() {
    return this.#timer === null;
  }

  /**
   * FunctionContext constructor
   * @param fn - Function to manage
   * @param ms - Execution delay time in milliseconds
   */
  constructor(fn: F, ms: number) {
    this.#function = fn;
    this.#delay = ms;
    this.#context = {
      self: undefined,
      args: null,
    };
  }

  /**
   * Initialize timer and context
   */
  clear() {
    this.#clearTimer();
    this.#clearContext();
  }

  /**
   * Set function execution context
   * @param self - The 'this' context to be used when executing the function
   * @param args - Arguments to pass when calling the function
   */
  setArguments(self: any, args: Parameters<F>) {
    this.#context.self = self;
    this.#context.args = args;
  }

  /**
   * Execute function with current context
   */
  execute() {
    if (this.#context.args === null) return;
    this.#function.apply(this.#context.self, this.#context.args);
    this.#clearContext();
  }

  /**
   * Schedule function execution after specified time
   * @param execute - Whether to execute function when timer completes
   */
  schedule(execute?: boolean) {
    if (this.#timer !== null) clearTimeout(this.#timer);
    const timer = setTimeout(() => {
      this.#timer = null;
      if (execute) this.execute();
      this.clear();
    }, this.#delay);
    this.#timer = timer;
  }

  /**
   * Cancel timer and execute function immediately
   */
  manualExecute() {
    this.execute();
    this.#clearTimer();
  }

  /**
   * Initialize function execution context
   * @private
   */
  #clearContext() {
    this.#context.self = undefined;
    this.#context.args = null;
  }

  /**
   * Cancel and initialize timer
   * @private
   */
  #clearTimer() {
    if (this.#timer === null) return;
    clearTimeout(this.#timer);
    this.#timer = null;
  }
}
