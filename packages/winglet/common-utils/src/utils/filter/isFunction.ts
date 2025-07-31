import type { Fn } from '@aileron/declare';

/**
 * Determines whether a value is a function with enhanced type safety.
 *
 * Provides reliable function detection with generic type support for
 * type-safe function validation and processing. Detects all function types
 * including regular functions, arrow functions, async functions, generators,
 * and class constructors.
 *
 * @template T - Expected function type extending Fn<any[], any>
 * @param value - Value to test for function type
 * @returns Type-safe boolean indicating whether the value is a function
 *
 * @example
 * Function type detection:
 * ```typescript
 * import { isFunction } from '@winglet/common-utils';
 *
 * const regularFunc = function() { return 'hello'; };
 * const arrowFunc = () => 'world';
 * const asyncFunc = async () => 'async';
 * const generatorFunc = function* () { yield 1; };
 * const classConstructor = class MyClass {};
 * const namedFunction = function namedFn() {};
 *
 * console.log(isFunction(regularFunc)); // true
 * console.log(isFunction(arrowFunc)); // true
 * console.log(isFunction(asyncFunc)); // true
 * console.log(isFunction(generatorFunc)); // true
 * console.log(isFunction(classConstructor)); // true
 * console.log(isFunction(namedFunction)); // true
 * 
 * // Non-functions return false
 * console.log(isFunction('string')); // false
 * console.log(isFunction({})); // false
 * console.log(isFunction([])); // false
 * console.log(isFunction(1)); // false
 * console.log(isFunction(null)); // false
 * console.log(isFunction(undefined)); // false
 * ```
 *
 * @example
 * Callback validation:
 * ```typescript
 * function processWithCallback<T>(data: T[], callback?: unknown) {
 *   if (isFunction(callback)) {
 *     // TypeScript knows callback is a function
 *     return data.map(item => callback(item));
 *   }
 *   return data;
 * }
 *
 * // Usage
 * const numbers = [1, 2, 3];
 * const result = processWithCallback(numbers, (x: number) => x * 2);
 * console.log(result); // [2, 4, 6]
 * ```
 *
 * @example
 * Event handler validation:
 * ```typescript
 * interface EventOptions {
 *   onSuccess?: unknown;
 *   onError?: unknown;
 * }
 *
 * function setupEventHandlers(options: EventOptions) {
 *   if (isFunction(options.onSuccess)) {
 *     document.addEventListener('success', options.onSuccess);
 *   }
 *   
 *   if (isFunction(options.onError)) {
 *     document.addEventListener('error', options.onError);
 *   }
 * }
 * ```
 *
 * @example
 * Higher-order function utilities:
 * ```typescript
 * function createMiddleware(middleware: unknown) {
 *   if (!isFunction(middleware)) {
 *     throw new Error('Middleware must be a function');
 *   }
 *   
 *   return (req: any, res: any, next: Function) => {
 *     // TypeScript knows middleware is callable
 *     return middleware(req, res, next);
 *   };
 * }
 * ```
 *
 * @example
 * Dynamic function invocation:
 * ```typescript
 * function safeInvoke(fn: unknown, ...args: any[]) {
 *   if (isFunction(fn)) {
 *     try {
 *       return fn(...args);
 *     } catch (error) {
 *       console.error('Function execution failed:', error);
 *       return null;
 *     }
 *   }
 *   console.warn('Attempted to invoke non-function:', typeof fn);
 *   return null;
 * }
 * ```
 *
 * @remarks
 * **Function Types Detected:**
 * - Regular functions (`function() {}`)
 * - Arrow functions (`() => {}`)
 * - Async functions (`async function() {}`)
 * - Generator functions (`function*() {}`)
 * - Class constructors (`class MyClass {}`)
 * - Built-in functions (`console.log`, `Array.isArray`, etc.)
 *
 * **Use Cases:**
 * - Callback and event handler validation
 * - Higher-order function utilities
 * - Dynamic function invocation
 * - Plugin and middleware systems
 * - Type guards for function parameters
 *
 * **Performance:** Direct typeof check provides optimal performance.
 */
export const isFunction = <T extends Fn<any[], any>>(
  value: unknown,
): value is T => typeof value === 'function';
