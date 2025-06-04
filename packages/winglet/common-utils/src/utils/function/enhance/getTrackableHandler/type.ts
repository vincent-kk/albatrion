import type { Dictionary, Fn } from '@aileron/declare';

/**
 * Interface for state management.
 *
 * Provides read-only access to state and update functionality.
 *
 * @template State - Type of the state object to manage
 *
 * @example
 * ```typescript
 * const stateManager: StateManager<{ count: number }> = {
 *   get state() { return { count: 0 }; },
 *   update: (updater) => { // state update logic }
 * };
 * ```
 */
export type StateManager<State extends Dictionary> = {
  /** Returns the current state as read-only. */
  get state(): State;

  /**
   * Updates the state.
   *
   * @param updater - Partial state to update or function that receives previous state and returns new state
   *
   * @example
   * ```typescript
   * // Direct object update
   * stateManager.update({ count: 5 });
   *
   * // Function-based update using previous state
   * stateManager.update(prev => ({ count: prev.count + 1 }));
   * ```
   */
  update: Fn<
    [updater: Partial<State> | Fn<[prev: State], Partial<State>>],
    void
  >;
};

/**
 * Type definition for trackable handler function.
 *
 * A function with state management, subscription pattern, and direct state property access
 * features added to the original async function.
 *
 * @template Args - Array of function argument types
 * @template Result - Function return value type
 * @template State - Type of the state object to manage
 *
 * @example
 * ```typescript
 * const handler: TrackableHandlerFunction<[string], User, { loading: boolean }> =
 *   getTrackableHandler(fetchUser, options);
 *
 * // Function call
 * const user = await handler('user-id');
 *
 * // State subscription
 * const unsubscribe = handler.subscribe(() => console.log('State changed'));
 *
 * // Direct state access
 * console.log(handler.loading); // boolean
 * console.log(handler.state);   // { loading: boolean }
 * ```
 */
export type TrackableHandlerFunction<
  Args extends any[] = [],
  Result = any,
  State extends Dictionary = {},
> = {
  /**
   * Executes the original function.
   *
   * @param args - Arguments to pass to the original function
   * @returns Promise containing the result of the original function execution
   */
  (...args: Args): Promise<Result>;

  /**
   * Subscribes to state change events.
   *
   * @param listener - Callback function to call when state changes
   * @returns Function to unsubscribe
   *
   * @example
   * ```typescript
   * const unsubscribe = handler.subscribe(() => {
   *   console.log('State has changed:', handler.state);
   * });
   *
   * // Unsubscribe
   * unsubscribe();
   * ```
   */
  readonly subscribe: (listener: Fn) => Fn;

  /**
   * Provides read-only access to the current state object.
   * @readonly
   */
  readonly state: State;
} & Omit<State, 'subscribe' | 'state'>; // Make each property of State directly accessible

/**
 * Options used when creating a TrackableHandler.
 *
 * @template Args - Array of function argument types
 * @template State - Type of the state object to manage
 *
 * @example
 * ```typescript
 * const options: TrackableHandlerOptions<[string], { loading: boolean; data: User | null }> = {
 *   preventConcurrent: true,
 *   initialState: { loading: false, data: null },
 *   beforeExecute: (args, stateManager) => {
 *     stateManager.update({ loading: true });
 *   },
 *   afterExecute: (args, stateManager) => {
 *     stateManager.update({ loading: false });
 *   }
 * };
 * ```
 */
export type TrackableHandlerOptions<
  Args extends any[] = [],
  State extends Dictionary = {},
> = {
  /**
   * Whether to prevent concurrent execution.
   *
   * If `true`, when a function is already running, new calls return `undefined`.
   * If `false`, multiple function calls can execute simultaneously.
   *
   * @defaultValue true
   *
   * @example
   * ```typescript
   * // Prevent concurrent execution (default)
   * { preventConcurrent: true }
   *
   * // Allow concurrent execution
   * { preventConcurrent: false }
   * ```
   */
  preventConcurrent?: boolean;

  /**
   * Initial value of the state.
   *
   * Defines the initial state of the handler when it is created.
   *
   * @example
   * ```typescript
   * {
   *   initialState: {
   *     loading: false,
   *     data: null,
   *     error: null,
   *     requestCount: 0
   *   }
   * }
   * ```
   */
  initialState: State;

  /**
   * Callback called before executing the original function.
   *
   * Mainly used for setting loading state, incrementing request count, etc.
   * If an exception occurs in this function, the original function will not be executed.
   *
   * @param args - Arguments passed to the original function
   * @param stateManager - State management object
   *
   * @example
   * ```typescript
   * {
   *   beforeExecute: (args, stateManager) => {
   *     console.log('Starting API call:', args);
   *     stateManager.update({ loading: true, error: null });
   *   }
   * }
   * ```
   */
  beforeExecute?: (args: Args, stateManager: StateManager<State>) => void;

  /**
   * Callback called after executing the original function.
   *
   * Always executed regardless of success/failure of the original function.
   * Mainly used for clearing loading state, updating statistics, etc.
   *
   * @param args - Arguments passed to the original function
   * @param stateManager - State management object
   *
   * @example
   * ```typescript
   * {
   *   afterExecute: (args, stateManager) => {
   *     console.log('API call completed');
   *     stateManager.update(prev => ({
   *       loading: false,
   *       requestCount: prev.requestCount + 1
   *     }));
   *   }
   * }
   * ```
   */
  afterExecute?: (args: Args, stateManager: StateManager<State>) => void;
};
