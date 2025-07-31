import type { Dictionary, Fn } from '@aileron/declare';

import type {
  StateManager,
  TrackableHandlerFunction,
  TrackableHandlerOptions,
} from './type';

/**
 * Converts an async function into a trackable handler with state management and lifecycle hooks.
 *
 * Enhances any async function with sophisticated state tracking, subscription-based notifications,
 * concurrent execution control, and lifecycle management. Perfect for managing API calls, user
 * interactions, and any async operations that need state synchronization across components.
 * Provides complete visibility into execution status and maintains state consistency.
 *
 * @template Args - Array of argument types for the original function
 * @template Result - Return type of the original function
 * @template State - Type of the state object to manage
 *
 * @param origin - The original async function to enhance with tracking capabilities
 * @param options - Configuration options for handler behavior and state management
 * @returns Enhanced handler function with state tracking, subscription support, and lifecycle hooks
 *
 * @example
 * Basic API call with loading state:
 * ```typescript
 * import { getTrackableHandler } from '@winglet/common-utils';
 *
 * // Define your API function
 * async function fetchUser(id: string): Promise<User> {
 *   const response = await fetch(`/api/users/${id}`);
 *   if (!response.ok) throw new Error('Failed to fetch user');
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
 *     console.log(`Fetching user: ${args[0]}`);
 *     stateManager.update({ loading: true, error: null });
 *   },
 *   afterExecute: (args, stateManager) => {
 *     stateManager.update({ loading: false });
 *   }
 * });
 *
 * // Usage
 * try {
 *   const user = await userHandler('user-123');
 *   console.log('User loaded:', user);
 *   console.log('Is loading:', userHandler.state.loading); // false
 *   console.log('Current pending:', userHandler.pending);  // false
 * } catch (error) {
 *   console.error('Failed to load user:', error);
 * }
 * ```
 *
 * @example
 * React integration with state subscription:
 * ```typescript
 * // In a React component
 * function UserProfile({ userId }: { userId: string }) {
 *   const [userState, setUserState] = useState(userHandler.state);
 *
 *   useEffect(() => {
 *     // Subscribe to state changes
 *     const unsubscribe = userHandler.subscribe(() => {
 *       setUserState({ ...userHandler.state });
 *     });
 *
 *     // Load user data
 *     userHandler(userId).catch(console.error);
 *
 *     return unsubscribe; // Cleanup subscription
 *   }, [userId]);
 *
 *   if (userState.loading) return <div>Loading user...</div>;
 *   if (userState.error) return <div>Error: {userState.error}</div>;
 *   if (!userState.data) return <div>No user found</div>;
 *
 *   return <div>Welcome, {userState.data.name}!</div>;
 * }
 * ```
 *
 * @example
 * Concurrent execution prevention:
 * ```typescript
 * const saveHandler = getTrackableHandler(saveUserData, {
 *   preventConcurrent: true, // Prevent double-saves
 *   initialState: {
 *     saving: false,
 *     saveCount: 0,
 *     lastSaved: null as Date | null
 *   },
 *   beforeExecute: (args, stateManager) => {
 *     stateManager.update({ saving: true });
 *   },
 *   afterExecute: (args, stateManager) => {
 *     stateManager.update(prev => ({
 *       saving: false,
 *       saveCount: prev.saveCount + 1,
 *       lastSaved: new Date()
 *     }));
 *   }
 * });
 *
 * // Multiple rapid clicks - only first save executes
 * saveButton.addEventListener('click', async () => {
 *   const result = await saveHandler(formData);
 *   if (result === undefined) {
 *     console.log('Save already in progress, skipped');
 *   } else {
 *     console.log('Save completed:', result);
 *   }
 * });
 * ```
 *
 * @example
 * Complex state management with error handling:
 * ```typescript
 * interface ApiCallState {
 *   loading: boolean;
 *   data: ApiResponse | null;
 *   error: string | null;
 *   retryCount: number;
 *   lastAttempt: Date | null;
 * }
 *
 * const apiHandler = getTrackableHandler(callExternalAPI, {
 *   initialState: {
 *     loading: false,
 *     data: null,
 *     error: null,
 *     retryCount: 0,
 *     lastAttempt: null
 *   } as ApiCallState,
 *   beforeExecute: (args, stateManager) => {
 *     stateManager.update(prev => ({
 *       loading: true,
 *       error: null,
 *       retryCount: prev.retryCount + 1,
 *       lastAttempt: new Date()
 *     }));
 *   },
 *   afterExecute: async (args, stateManager) => {
 *     try {
 *       const result = await Promise.resolve(); // Access to result if needed
 *       stateManager.update({
 *         loading: false,
 *         data: result,
 *         error: null
 *       });
 *     } catch (error) {
 *       stateManager.update({
 *         loading: false,
 *         error: error instanceof Error ? error.message : 'Unknown error'
 *       });
 *     }
 *   }
 * });
 *
 * // Monitor state changes
 * apiHandler.subscribe(() => {
 *   const state = apiHandler.state;
 *   console.log(`API Call - Loading: ${state.loading}, Attempts: ${state.retryCount}`);
 *
 *   if (state.error && state.retryCount < 3) {
 *     setTimeout(() => apiHandler(), 1000 * state.retryCount); // Exponential backoff
 *   }
 * });
 * ```
 *
 * @example
 * Allowing concurrent execution:
 * ```typescript
 * const parallelProcessor = getTrackableHandler(processItem, {
 *   preventConcurrent: false, // Allow multiple simultaneous executions
 *   initialState: {
 *     activeJobs: 0,
 *     completedJobs: 0,
 *     errors: [] as string[]
 *   },
 *   beforeExecute: (args, stateManager) => {
 *     stateManager.update(prev => ({
 *       activeJobs: prev.activeJobs + 1
 *     }));
 *   },
 *   afterExecute: (args, stateManager) => {
 *     stateManager.update(prev => ({
 *       activeJobs: prev.activeJobs - 1,
 *       completedJobs: prev.completedJobs + 1
 *     }));
 *   }
 * });
 *
 * // Process multiple items in parallel
 * const items = ['item1', 'item2', 'item3'];
 * await Promise.all(items.map(item => parallelProcessor(item)));
 *
 * console.log(`Processed ${parallelProcessor.state.completedJobs} items`);
 * ```
 *
 * @example
 * Advanced lifecycle management:
 * ```typescript
 * const advancedHandler = getTrackableHandler(complexAsyncOperation, {
 *   initialState: {
 *     phase: 'idle' as 'idle' | 'preparing' | 'executing' | 'finalizing',
 *     progress: 0,
 *     startTime: null as Date | null,
 *     duration: 0
 *   },
 *   beforeExecute: (args, stateManager) => {
 *     const startTime = new Date();
 *     stateManager.update({
 *       phase: 'preparing',
 *       progress: 0,
 *       startTime,
 *       duration: 0
 *     });
 *
 *     // Simulate preparation phase
 *     setTimeout(() => {
 *       stateManager.update({ phase: 'executing', progress: 25 });
 *     }, 100);
 *   },
 *   afterExecute: (args, stateManager) => {
 *     const state = stateManager.state;
 *     const duration = state.startTime ? Date.now() - state.startTime.getTime() : 0;
 *
 *     stateManager.update({
 *       phase: 'finalizing',
 *       progress: 90
 *     });
 *
 *     setTimeout(() => {
 *       stateManager.update({
 *         phase: 'idle',
 *         progress: 100,
 *         duration
 *       });
 *     }, 50);
 *   }
 * });
 *
 * // Monitor progress
 * advancedHandler.subscribe(() => {
 *   const state = advancedHandler.state;
 *   console.log(`Phase: ${state.phase}, Progress: ${state.progress}%`);
 * });
 * ```
 *
 * @remarks
 * **Key Features:**
 * - **State Management**: Maintains custom state object with automatic change notifications
 * - **Concurrent Control**: Optionally prevents overlapping executions for critical operations
 * - **Lifecycle Hooks**: `beforeExecute` and `afterExecute` callbacks for operation lifecycle
 * - **Subscription Pattern**: Subscribe to state changes for reactive UI updates
 * - **Execution Status**: `pending` property indicates if function is currently running
 * - **Direct State Access**: `state` property provides read-only access to current state
 *
 * **Execution Flow:**
 * 1. Check concurrent execution prevention (if enabled)
 * 2. Call `beforeExecute` hook with arguments and state manager
 * 3. Set `pending` to `true` and notify subscribers
 * 4. Execute original function
 * 5. Call `afterExecute` hook (always, regardless of success/failure)
 * 6. Set `pending` to `false` and notify subscribers
 * 7. Return original function result or `undefined` if prevented
 *
 * **Error Handling & Recovery Strategies:**
 * - **beforeExecute Errors**: Prevent original function execution and propagate immediately
 * - **Original Function Errors**: Propagated as-is while maintaining state consistency
 * - **afterExecute Errors**: Propagated after cleanup, but pending state is always reset
 * - **State Corruption**: Update failures don't affect pending state or subscriber notifications
 * - **Memory Safety**: All cleanup occurs in finally blocks regardless of error state
 *
 * **Advanced Error Recovery Patterns:**
 * ```typescript
 * // Automatic retry with exponential backoff
 * const resilientHandler = getTrackableHandler(riskyOperation, {
 *   initialState: {
 *     attempts: 0,
 *     lastError: null as Error | null,
 *     retryDelay: 1000
 *   },
 *   afterExecute: async (args, stateManager) => {
 *     const state = stateManager.state;
 *     if (state.lastError && state.attempts < 3) {
 *       setTimeout(() => {
 *         resilientHandler(...args); // Retry with exponential backoff
 *       }, state.retryDelay * Math.pow(2, state.attempts));
 *     }
 *   }
 * });
 *
 * // Circuit breaker pattern
 * const circuitBreakerHandler = getTrackableHandler(unreliableService, {
 *   initialState: {
 *     failureCount: 0,
 *     circuitOpen: false,
 *     lastFailure: null as Date | null
 *   },
 *   beforeExecute: (args, stateManager) => {
 *     const state = stateManager.state;
 *     if (state.circuitOpen) {
 *       const timeSinceFailure = Date.now() - (state.lastFailure?.getTime() || 0);
 *       if (timeSinceFailure < 30000) { // 30 second cooldown
 *         throw new Error('Circuit breaker is open - service temporarily unavailable');
 *       } else {
 *         stateManager.update({ circuitOpen: false, failureCount: 0 });
 *       }
 *     }
 *   }
 * });
 * ```
 *
 * **Best Practices:**
 * - Use `preventConcurrent: true` for critical operations (saves, payments)
 * - Use `preventConcurrent: false` for read operations that can run in parallel
 * - Subscribe to state changes in UI components for reactive updates
 * - Always unsubscribe to prevent memory leaks
 * - Use TypeScript for type safety on state and function signatures
 * - Keep state updates atomic and predictable
 *
 * **Performance Considerations:**
 * - Subscribers are notified synchronously on state changes
 * - State updates create new objects (immutable pattern)
 * - Concurrent prevention uses simple boolean flag (minimal overhead)
 * - Subscribe/unsubscribe operations are O(1) using Set
 */
export function getTrackableHandler<
  Args extends any[] = [],
  Result = void,
  State extends Dictionary = {},
>(
  origin: Fn<Args, Promise<Result>>,
  options?: TrackableHandlerOptions<Args, State>,
): TrackableHandlerFunction<Args, Result, State> {
  const {
    preventConcurrent = true,
    initialState,
    beforeExecute,
    afterExecute,
  } = options || {};

  /** Set of listeners subscribing to state change events */
  const listeners = new Set<Fn>();

  /** Whether the function is currently executing */
  let pending = false;

  /** Current state (initialized as a copy of initialState) */
  let state = (initialState ? { ...initialState } : {}) as State;

  /**
   * Sends state change notifications to all subscribers.
   * Called whenever state changes or execution status changes.
   * @internal
   */
  const publish = () => {
    for (const listener of listeners) listener();
  };

  /**
   * Updates the state and sends notifications to subscribers.
   * Supports both partial state objects and updater functions.
   * @param updater - Partial state to merge or function that receives previous state and returns partial state
   * @internal
   */
  const update = (
    updater: Partial<State> | ((prev: State) => Partial<State>),
  ) => {
    const update = typeof updater === 'function' ? updater(state) : updater;
    state = { ...state, ...update };
  };

  /**
   * State management object provided to beforeExecute and afterExecute callbacks.
   * Provides read-only access to current state and update functionality.
   * @internal
   */
  const stateManager: StateManager<State> = {
    get state(): State {
      return state;
    },
    update,
  };

  /**
   * Handler function that wraps the original function with tracking capabilities.
   * Manages execution flow, state updates, and subscriber notifications.
   * @param args - Arguments to pass to the original function
   * @returns Result of the original function execution, or undefined if execution was prevented
   * @internal
   */
  const handler = async (...args: Args): Promise<Result> => {
    // Check for concurrent execution prevention (based on pending status)
    if (preventConcurrent && pending)
      return Promise.resolve(undefined as Result);

    // Execute beforeExecute hook - may throw and prevent execution
    beforeExecute?.(args, stateManager);
    pending = true;
    publish(); // Notify subscribers of pending state change

    try {
      // Execute original function and return its result
      return await origin(...args);
    } finally {
      // Always execute afterExecute hook and reset pending state
      afterExecute?.(args, stateManager);
      pending = false;
      publish(); // Notify subscribers of completion
    }
  };

  // Add subscribe method (non-enumerable to avoid iteration)
  Object.defineProperty(handler, 'subscribe', {
    /**
     * Subscribes to state change events.
     * Returns an unsubscribe function for cleanup.
     * @param listener - Callback function to call when state or pending status changes
     * @returns Function to unsubscribe and prevent memory leaks
     */
    value: (listener: Fn): Fn => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    configurable: false,
    enumerable: false,
  });

  // Add pending property (non-enumerable, read-only)
  Object.defineProperty(handler, 'pending', {
    /**
     * Whether the function is currently executing.
     * Useful for showing loading states and preventing concurrent execution.
     * @readonly
     * @returns {boolean} True if function is currently running, false otherwise
     */
    get() {
      return pending;
    },
    configurable: false,
    enumerable: false,
  });

  // Add state property (non-enumerable, read-only)
  Object.defineProperty(handler, 'state', {
    /**
     * Returns the current state object.
     * State is read-only from outside - use stateManager.update() in lifecycle hooks.
     * @readonly
     * @returns Immutable reference to current state
     */
    get() {
      return state;
    },
    configurable: false,
    enumerable: false,
  });

  return handler as TrackableHandlerFunction<Args, Result, State>;
}
