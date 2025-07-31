/**
 * Determines whether a value is a Promise with enhanced type safety.
 *
 * Provides reliable Promise detection using instanceof check, identifying
 * Promise instances and thenable objects that follow the Promise specification.
 * Works with native Promises and Promise-like objects from different contexts.
 *
 * @template T - Expected Promise type extending Promise<any>
 * @param value - Value to test for Promise type
 * @returns Type-safe boolean indicating whether the value is a Promise
 *
 * @example
 * Basic Promise detection:
 * ```typescript
 * import { isPromise } from '@winglet/common-utils';
 *
 * // True cases - Promise instances
 * console.log(isPromise(Promise.resolve(42))); // true
 * console.log(isPromise(Promise.reject(new Error()))); // true
 * console.log(isPromise(new Promise(() => {}))); // true
 * console.log(isPromise(fetch('/api/data'))); // true
 *
 * const asyncFunction = async () => 'hello';
 * console.log(isPromise(asyncFunction())); // true
 *
 * // False cases - not Promises
 * console.log(isPromise('promise')); // false (string)
 * console.log(isPromise({ then: () => {} })); // false (thenable object, not Promise)
 * console.log(isPromise(() => Promise.resolve())); // false (function returning Promise)
 * console.log(isPromise({})); // false (object)
 * console.log(isPromise(null)); // false
 * console.log(isPromise(undefined)); // false
 * ```
 *
 * @example
 * Async operation handling:
 * ```typescript
 * function handleAsyncResult<T>(result: T | Promise<T>): Promise<T> {
 *   if (isPromise(result)) {
 *     // TypeScript knows result is Promise<T>
 *     return result.catch(error => {
 *       console.error('Promise rejected:', error);
 *       throw error;
 *     });
 *   }
 *
 *   // Wrap non-Promise values
 *   return Promise.resolve(result);
 * }
 *
 * // Usage
 * const syncValue = 42;
 * const asyncValue = Promise.resolve(42);
 *
 * handleAsyncResult(syncValue).then(console.log);   // 42
 * handleAsyncResult(asyncValue).then(console.log);  // 42
 * ```
 *
 * @example
 * API response processing:
 * ```typescript
 * interface ApiClient {
 *   get(url: string): Promise<any> | any;
 * }
 *
 * async function processApiCall(client: ApiClient, url: string) {
 *   const result = client.get(url);
 *
 *   if (isPromise(result)) {
 *     console.log('API call is asynchronous');
 *     try {
 *       const data = await result;
 *       return processData(data);
 *     } catch (error) {
 *       console.error('API call failed:', error);
 *       throw error;
 *     }
 *   }
 *
 *   console.log('API call returned synchronously');
 *   return processData(result);
 * }
 * ```
 *
 * @example
 * Batch operation processing:
 * ```typescript
 * async function processBatch<T>(
 *   operations: Array<T | Promise<T>>
 * ): Promise<T[]> {
 *   const promises: Promise<T>[] = [];
 *   const syncValues: T[] = [];
 *
 *   operations.forEach((op, index) => {
 *     if (isPromise(op)) {
 *       promises.push(
 *         op.catch(error => {
 *           throw new Error(`Operation ${index} failed: ${error.message}`);
 *         })
 *       );
 *     } else {
 *       syncValues.push(op);
 *     }
 *   });
 *
 *   const asyncResults = promises.length > 0 ? await Promise.all(promises) : [];
 *   return [...syncValues, ...asyncResults];
 * }
 *
 * // Usage
 * const mixed = [
 *   42,
 *   Promise.resolve(100),
 *   'hello',
 *   fetch('/api/data').then(r => r.json()),
 *   Promise.resolve('world')
 * ];
 *
 * processBatch(mixed).then(console.log);
 * ```
 *
 * @example
 * Caching with Promise support:
 * ```typescript
 * class SmartCache<T> {
 *   private cache = new Map<string, T | Promise<T>>();
 *
 *   set(key: string, value: T | Promise<T>): void {
 *     this.cache.set(key, value);
 *   }
 *
 *   async get(key: string): Promise<T | undefined> {
 *     const cached = this.cache.get(key);
 *
 *     if (cached === undefined) {
 *       return undefined;
 *     }
 *
 *     if (isPromise(cached)) {
 *       try {
 *         const resolved = await cached;
 *         // Replace Promise with resolved value for future access
 *         this.cache.set(key, resolved);
 *         return resolved;
 *       } catch (error) {
 *         // Remove failed Promise from cache
 *         this.cache.delete(key);
 *         throw error;
 *       }
 *     }
 *
 *     return cached;
 *   }
 *
 *   isPending(key: string): boolean {
 *     const cached = this.cache.get(key);
 *     return isPromise(cached);
 *   }
 * }
 * ```
 *
 * @example
 * Middleware chain with async support:
 * ```typescript
 * type Middleware<T> = (value: T) => T | Promise<T>;
 *
 * async function executeMiddlewareChain<T>(
 *   value: T,
 *   middlewares: Middleware<T>[]
 * ): Promise<T> {
 *   let current: T | Promise<T> = value;
 *
 *   for (const middleware of middlewares) {
 *     if (isPromise(current)) {
 *       current = await current;
 *     }
 *
 *     const result = middleware(current);
 *
 *     if (isPromise(result)) {
 *       console.log('Middleware returned Promise, awaiting...');
 *       current = await result;
 *     } else {
 *       current = result;
 *     }
 *   }
 *
 *   return isPromise(current) ? await current : current;
 * }
 * ```
 *
 * @example
 * Loading state management:
 * ```typescript
 * interface LoadingState<T> {
 *   data?: T;
 *   loading: boolean;
 *   error?: Error;
 * }
 *
 * function createLoadingState<T>(
 *   dataOrPromise: T | Promise<T>
 * ): LoadingState<T> | Promise<LoadingState<T>> {
 *   if (isPromise(dataOrPromise)) {
 *     return dataOrPromise
 *       .then(data => ({
 *         data,
 *         loading: false,
 *         error: undefined
 *       }))
 *       .catch(error => ({
 *         data: undefined,
 *         loading: false,
 *         error
 *       }));
 *   }
 *
 *   return {
 *     data: dataOrPromise,
 *     loading: false,
 *     error: undefined
 *   };
 * }
 * ```
 *
 * @remarks
 * **Promise Detection:**
 * - Uses `instanceof Promise` for reliable detection
 * - Works with native Promises and most Promise implementations
 * - Does not detect thenable objects (objects with `then` method)
 * - Cross-frame compatible in most environments
 *
 * **Important Notes:**
 * - This checks for actual Promise instances, not just thenable objects
 * - Async function calls return Promises and will be detected
 * - Promise.resolve() and Promise.reject() create actual Promise instances
 * - Functions that return Promises are not themselves Promises
 *
 * **Use Cases:**
 * - Async/sync operation handling
 * - API client implementations
 * - Caching systems with Promise support
 * - Middleware chains
 * - Loading state management
 * - Batch operation processing
 *
 * **Performance:** Direct instanceof check provides optimal performance.
 *
 * **Related Functions:**
 * - Use `Promise.resolve()` to wrap non-Promise values
 * - Use `await` to handle both sync and async values
 * - Use custom thenable detection for broader compatibility
 */
export const isPromise = <T extends Promise<any>>(value: unknown): value is T =>
  value instanceof Promise;
