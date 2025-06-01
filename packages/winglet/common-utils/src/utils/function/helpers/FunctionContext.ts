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
  private __context__: ExecutionContext<F>;
  /** Timer ID */
  private __timer__: ReturnType<typeof setTimeout> | null = null;
  /** Function to manage */
  private __function__: F;
  /** Execution delay time in milliseconds */
  private __delay__: number;

  /**
   * Whether there is no timer currently waiting for execution
   * @returns true if there is no timer, false if there is
   */
  public get isIdle() {
    return this.__timer__ === null;
  }

  /**
   * FunctionContext constructor
   * @param fn - Function to manage
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
   * Initialize timer and context
   */
  public clear() {
    this.__clearTimer__();
    this.__clearContext__();
  }

  /**
   * Set function execution context
   * @param self - The 'this' context to be used when executing the function
   * @param args - Arguments to pass when calling the function
   */
  public setArguments(self: any, args: Parameters<F>) {
    this.__context__.self = self;
    this.__context__.args = args;
  }

  /**
   * Execute function with current context
   */
  public execute() {
    if (this.__context__.args === null) return;
    this.__function__.apply(this.__context__.self, this.__context__.args);
    this.__clearContext__();
  }

  /**
   * Schedule function execution after specified time
   * @param execute - Whether to execute function when timer completes
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
   * Cancel timer and execute function immediately
   */
  public manualExecute() {
    this.execute();
    this.__clearTimer__();
  }

  /**
   * Initialize function execution context
   * @private
   */
  private __clearContext__() {
    this.__context__.self = undefined;
    this.__context__.args = null;
  }

  /**
   * Cancel and initialize timer
   * @private
   */
  private __clearTimer__() {
    if (this.__timer__ === null) return;
    clearTimeout(this.__timer__);
    this.__timer__ = null;
  }
}
