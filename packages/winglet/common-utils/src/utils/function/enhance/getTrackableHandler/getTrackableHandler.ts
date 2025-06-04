import type { Dictionary, Fn } from '@aileron/declare';

import type {
  StateManager,
  TrackableHandlerFunction,
  TrackableHandlerOptions,
} from './type';

/**
 * Converts an async function to a trackable handler.
 *
 * This function wraps the original async function to add the following features:
 * - State management (loading, data, error, etc.)
 * - State change notifications through subscription pattern
 * - Concurrent execution prevention (optional)
 * - Lifecycle hooks for before/after execution
 * - Direct access to state properties
 *
 * @template Args - Array of argument types for the original function
 * @template Result - Return type of the original function
 * @template State - Type of the state object to manage
 *
 * @param origin - The original async function to wrap
 * @param options - Configuration options for the handler
 *
 * @returns A handler function with trackable features added
 *
 * @example
 * ```typescript
 * // Define API call function
 * async function fetchUser(id: string): Promise<User> {
 *   const response = await fetch(`/api/users/${id}`);
 *   return response.json();
 * }
 *
 * // Create trackable handler
 * const userHandler = getTrackableHandler(fetchUser, {
 *   preventConcurrent: true,
 *   initialState: {
 *     loading: false,
 *     data: null as User | null,
 *     error: null as string | null
 *   },
 *   beforeExecute: (args, stateManager) => {
 *     stateManager.update({ loading: true, error: null });
 *   },
 *   afterExecute: (args, stateManager) => {
 *     stateManager.update({ loading: false });
 *   }
 * });
 *
 * // Usage
 * const user = await userHandler('user-123');
 * console.log(userHandler.loading); // false
 * console.log(userHandler.data);    // User object or null
 *
 * // Subscribe to state changes
 * const unsubscribe = userHandler.subscribe(() => {
 *   console.log('State changed:', userHandler.state);
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Example allowing concurrent execution
 * const parallelHandler = getTrackableHandler(someAsyncFunction, {
 *   preventConcurrent: false,
 *   initialState: { callCount: 0 },
 *   afterExecute: (_, stateManager) => {
 *     stateManager.update(prev => ({ callCount: prev.callCount + 1 }));
 *   }
 * });
 *
 * // Multiple calls execute concurrently
 * await Promise.all([
 *   parallelHandler(),
 *   parallelHandler(),
 *   parallelHandler()
 * ]);
 * console.log(parallelHandler.callCount); // 3
 * ```
 *
 * @remarks
 * - When `preventConcurrent` is `true`, if a function is already running, new calls return `undefined`.
 * - If an exception occurs in `beforeExecute`, the original function will not be executed.
 * - `afterExecute` is always executed regardless of the success/failure of the original function.
 * - Subscribers are automatically notified when state is updated.
 * - The `subscribe` and `state` properties of the returned handler are non-enumerable.
 *
 * @throws {Error} Propagates exceptions thrown in `beforeExecute` as-is.
 * @throws {Error} Propagates exceptions thrown in the original function as-is.
 */
export function getTrackableHandler<
  Args extends any[] = [],
  Result = any,
  State extends Dictionary = {},
>(
  origin: Fn<Args, Promise<Result>>,
  options: TrackableHandlerOptions<Args, State>,
): TrackableHandlerFunction<Args, Result, State> {
  const {
    preventConcurrent = true,
    initialState,
    beforeExecute,
    afterExecute,
  } = options;

  /** Set of listeners subscribing to state change events */
  const listeners = new Set<Fn>();

  /** Current state (initialized as a copy of initialState) */
  let state = { ...initialState };

  /**
   * Sends state change notifications to all subscribers.
   * @internal
   */
  const notify = (): void => {
    listeners.forEach((fn) => fn());
  };

  /**
   * Updates the state and sends notifications to subscribers.
   * @param updater - Partial state to update or state update function
   * @internal
   */
  const update = (
    updater: Partial<State> | ((prev: State) => Partial<State>),
  ): void => {
    const update = typeof updater === 'function' ? updater(state) : updater;
    state = { ...state, ...update };
    notify();
  };

  /**
   * State management object used in beforeExecute and afterExecute callbacks
   * @internal
   */
  const stateManager: StateManager<State> = {
    get state(): State {
      return state;
    },
    update,
  };

  /**
   * Handler function that wraps the original function
   * @param args - Arguments to pass to the original function
   * @returns Result of the original function execution
   * @internal
   */
  const handler = async (...args: Args): Promise<Result> => {
    // Check for concurrent execution prevention (based on loading state)
    if (preventConcurrent && (state as any).loading === true)
      return Promise.resolve(undefined as Result);

    // Call before execution callback
    beforeExecute?.(args, stateManager);

    try {
      // Execute original function
      return await origin(...args);
    } finally {
      // Call after execution callback regardless of success/failure
      afterExecute?.(args, stateManager);
    }
  };

  // Add subscribe method (non-enumerable)
  Object.defineProperty(handler, 'subscribe', {
    /**
     * Subscribes to state change events.
     * @param listener - Callback function to call when state changes
     * @returns Function to unsubscribe
     */
    value: (listener: Fn): (() => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    configurable: false,
    enumerable: false,
  });

  // Add state property (non-enumerable)
  Object.defineProperty(handler, 'state', {
    /**
     * Returns the current state object.
     * @returns Read-only copy of current state
     */
    get(): State {
      return state;
    },
    configurable: false,
    enumerable: false,
  });

  // Add direct access to each property of the state on the handler
  for (const key of Object.keys(state)) {
    if (!Object.prototype.hasOwnProperty.call(handler, key)) {
      Object.defineProperty(handler, key, {
        /**
         * Returns the current value of a specific state property.
         * @returns Current value of the property
         */
        get() {
          return state[key];
        },
        configurable: true,
        enumerable: true,
      });
    }
  }

  return handler as TrackableHandlerFunction<Args, Result, State>;
}
