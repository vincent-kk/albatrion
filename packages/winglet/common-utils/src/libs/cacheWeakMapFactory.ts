/**
 * Creates a memory-efficient WeakMap-based cache optimized for object-keyed storage.
 *
 * Provides a wrapper around native WeakMap with enhanced API for caching scenarios
 * where object references serve as keys. Offers automatic garbage collection benefits
 * as entries are automatically removed when key objects are no longer referenced elsewhere,
 * preventing memory leaks in long-running applications.
 *
 * @template V - Type of values stored in the cache
 * @template K - Type of object keys (must extend object for WeakMap compatibility)
 * @param defaultValue - Optional existing WeakMap instance for initialization
 * @returns Enhanced WeakMap cache with convenient access methods
 *
 * @example
 * Component instance caching:
 * ```typescript
 * import { cacheWeakMapFactory } from '@winglet/common-utils';
 *
 * interface ComponentConfig {
 *   theme: string;
 *   size: 'small' | 'medium' | 'large';
 *   disabled: boolean;
 * }
 *
 * const componentCache = cacheWeakMapFactory<ComponentConfig, HTMLElement>();
 *
 * function setupComponent(element: HTMLElement) {
 *   if (componentCache.has(element)) {
 *     return componentCache.get(element)!;
 *   }
 *
 *   const config: ComponentConfig = {
 *     theme: element.dataset.theme || 'default',
 *     size: (element.dataset.size as any) || 'medium',
 *     disabled: element.hasAttribute('disabled')
 *   };
 *
 *   componentCache.set(element, config);
 *   return config;
 * }
 *
 * // When element is removed from DOM and no longer referenced,
 * // the cache entry is automatically garbage collected
 * ```
 *
 * @example
 * Function memoization with object parameters:
 * ```typescript
 * interface QueryParams {
 *   filters: Record<string, any>;
 *   sort: string;
 *   page: number;
 * }
 *
 * const queryCache = cacheWeakMapFactory<Promise<ApiResponse>, QueryParams>();
 *
 * async function fetchData(params: QueryParams): Promise<ApiResponse> {
 *   if (queryCache.has(params)) {
 *     console.log('Returning cached result');
 *     return queryCache.get(params)!;
 *   }
 *
 *   console.log('Fetching new data');
 *   const promise = fetch('/api/data', {
 *     method: 'POST',
 *     body: JSON.stringify(params)
 *   }).then(r => r.json());
 *
 *   queryCache.set(params, promise);
 *   return promise;
 * }
 *
 * // Usage
 * const params1 = { filters: { status: 'active' }, sort: 'name', page: 1 };
 * const params2 = { filters: { status: 'active' }, sort: 'name', page: 1 };
 *
 * await fetchData(params1); // Fetches from API
 * await fetchData(params1); // Returns cached result
 * await fetchData(params2); // Fetches from API (different object reference)
 * ```
 *
 * @example
 * User session management:
 * ```typescript
 * interface UserSession {
 *   userId: string;
 *   permissions: string[];
 *   lastActivity: Date;
 *   preferences: Record<string, any>;
 * }
 *
 * const sessionCache = cacheWeakMapFactory<UserSession, Request>();
 *
 * function getOrCreateSession(request: Request): UserSession {
 *   if (sessionCache.has(request)) {
 *     const session = sessionCache.get(request)!;
 *     session.lastActivity = new Date();
 *     return session;
 *   }
 *
 *   const session: UserSession = {
 *     userId: extractUserId(request),
 *     permissions: extractPermissions(request),
 *     lastActivity: new Date(),
 *     preferences: {}
 *   };
 *
 *   sessionCache.set(request, session);
 *   return session;
 * }
 *
 * // Session data is automatically cleaned up when request objects
 * // are garbage collected after response completion
 * ```
 *
 * @example
 * DOM event handler management:
 * ```typescript
 * interface EventHandlers {
 *   click?: EventListener;
 *   hover?: EventListener;
 *   focus?: EventListener;
 * }
 *
 * const handlerCache = cacheWeakMapFactory<EventHandlers, Element>();
 *
 * function attachEventHandlers(element: Element, handlers: EventHandlers) {
 *   // Check if handlers already attached
 *   if (handlerCache.has(element)) {
 *     console.log('Handlers already attached to element');
 *     return;
 *   }
 *
 *   // Attach new handlers
 *   if (handlers.click) element.addEventListener('click', handlers.click);
 *   if (handlers.hover) element.addEventListener('mouseenter', handlers.hover);
 *   if (handlers.focus) element.addEventListener('focus', handlers.focus);
 *
 *   // Cache the handlers for future reference
 *   handlerCache.set(element, handlers);
 * }
 *
 * function getAttachedHandlers(element: Element): EventHandlers | undefined {
 *   return handlerCache.get(element);
 * }
 * ```
 *
 * @example
 * Computed property caching:
 * ```typescript
 * interface ComputedValues {
 *   expensiveCalculation: number;
 *   formattedData: string[];
 *   validationResults: ValidationResult[];
 * }
 *
 * const computedCache = cacheWeakMapFactory<ComputedValues, DataModel>();
 *
 * function getComputedValues(model: DataModel): ComputedValues {
 *   if (computedCache.has(model)) {
 *     return computedCache.get(model)!;
 *   }
 *
 *   const computed: ComputedValues = {
 *     expensiveCalculation: performExpensiveCalculation(model),
 *     formattedData: formatDataForDisplay(model),
 *     validationResults: validateModel(model)
 *   };
 *
 *   computedCache.set(model, computed);
 *   return computed;
 * }
 * ```
 *
 * @remarks
 * **Key Advantages:**
 * - **Automatic Memory Management**: Entries are garbage collected when keys are no longer referenced
 * - **Memory Leak Prevention**: No risk of memory leaks from forgotten cache entries
 * - **Object Identity Based**: Uses object reference equality for key comparison
 * - **High Performance**: O(1) average time complexity for all operations
 * - **Type Safety**: Full TypeScript support with generic constraints
 *
 * **Limitations:**
 * - **Object Keys Only**: Keys must be objects, not primitives
 * - **No Enumeration**: Cannot iterate over WeakMap entries (by design)
 * - **No Size Property**: Cannot determine number of entries
 * - **No Clear Method**: Cannot bulk clear all entries
 *
 * **Best Use Cases:**
 * - **DOM Element Associations**: Link data to DOM elements
 * - **Object Metadata**: Store additional data for existing objects
 * - **Request/Response Caching**: Cache data tied to request objects
 * - **Component State**: Associate state with component instances
 * - **Temporary Associations**: Create temporary object relationships
 *
 * **Memory Benefits:**
 * WeakMap entries don't prevent key objects from being garbage collected,
 * making it ideal for scenarios where you want to associate data with objects
 * without extending their lifetime.
 */
export const cacheWeakMapFactory = <V, K extends object = object>(
  defaultValue?: WeakMap<K, V>,
) => {
  // Create new WeakMap if default value is not provided
  const cache = defaultValue ?? (new WeakMap() as WeakMap<K, V>);
  return {
    /**
     * Returns the original WeakMap object
     * @returns The original WeakMap object
     */
    getCache: () => cache,
    /**
     * Checks if the given key exists in the cache
     * @param key - The key to check
     * @returns Whether the key exists
     */
    has: (key: K) => cache.has(key),
    /**
     * Gets the value for the given key
     * @param key - The key to find the value for
     * @returns The value corresponding to the key or undefined
     */
    get: (key: K) => cache.get(key),
    /**
     * Stores a value for the given key
     * @param key - The key to store
     * @param value - The value to store
     * @returns The cache object itself for method chaining
     */
    set: (key: K, value: V) => cache.set(key, value),
    /**
     * Deletes the key and its corresponding value from the cache
     * @param key - The key to delete
     * @returns Whether the deletion was successful
     */
    delete: (key: K) => cache.delete(key),
  };
};
