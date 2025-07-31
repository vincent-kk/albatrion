/**
 * Determines whether a value is an integer with enhanced type safety.
 *
 * Type-extended alias for the native Number.isInteger method, providing
 * reliable integer detection that correctly handles edge cases like
 * floating point precision and special numeric values.
 *
 * @param value - Value to test for integer type
 * @returns Type-safe boolean indicating whether the value is an integer
 *
 * @example
 * Basic integer detection:
 * ```typescript
 * import { isInteger } from '@winglet/common-utils';
 *
 * // True cases - integers
 * console.log(isInteger(42)); // true
 * console.log(isInteger(-17)); // true
 * console.log(isInteger(0)); // true
 * console.log(isInteger(Number.MAX_SAFE_INTEGER)); // true
 * console.log(isInteger(Number.MIN_SAFE_INTEGER)); // true
 * console.log(isInteger(1.0)); // true (1.0 is mathematically an integer)
 * console.log(isInteger(-0)); // true
 * 
 * // False cases - not integers
 * console.log(isInteger(3.14)); // false (decimal)
 * console.log(isInteger(0.1)); // false (decimal)
 * console.log(isInteger(NaN)); // false
 * console.log(isInteger(Infinity)); // false
 * console.log(isInteger(-Infinity)); // false
 * console.log(isInteger('42')); // false (string)
 * console.log(isInteger(true)); // false (boolean)
 * console.log(isInteger(null)); // false
 * console.log(isInteger(undefined)); // false
 * console.log(isInteger({})); // false
 * ```
 *
 * @example
 * Form validation:
 * ```typescript
 * interface FormData {
 *   age: unknown;
 *   quantity: unknown;
 *   rating: unknown;
 * }
 *
 * function validateIntegerFields(formData: FormData) {
 *   const errors: string[] = [];
 *   
 *   if (!isInteger(formData.age)) {
 *     errors.push('Age must be an integer');
 *   } else if (formData.age < 0 || formData.age > 150) {
 *     errors.push('Age must be between 0 and 150');
 *   }
 *   
 *   if (!isInteger(formData.quantity)) {
 *     errors.push('Quantity must be an integer');
 *   } else if (formData.quantity < 1) {
 *     errors.push('Quantity must be at least 1');
 *   }
 *   
 *   if (!isInteger(formData.rating)) {
 *     errors.push('Rating must be an integer');
 *   } else if (formData.rating < 1 || formData.rating > 5) {
 *     errors.push('Rating must be between 1 and 5');
 *   }
 *   
 *   return errors;
 * }
 * ```
 *
 * @example
 * Array indexing validation:
 * ```typescript
 * function safeArrayAccess<T>(array: T[], index: unknown): T | undefined {
 *   if (!isInteger(index)) {
 *     console.warn('Array index must be an integer');
 *     return undefined;
 *   }
 *   
 *   if (index < 0 || index >= array.length) {
 *     console.warn('Array index out of bounds');
 *     return undefined;
 *   }
 *   
 *   return array[index];
 * }
 *
 * // Usage
 * const numbers = [10, 20, 30, 40, 50];
 * console.log(safeArrayAccess(numbers, 2)); // 30
 * console.log(safeArrayAccess(numbers, 2.5)); // undefined (not integer)
 * console.log(safeArrayAccess(numbers, -1)); // undefined (out of bounds)
 * ```
 *
 * @example
 * API parameter validation:
 * ```typescript
 * interface PaginationParams {
 *   page?: unknown;
 *   limit?: unknown;
 *   offset?: unknown;
 * }
 *
 * function validatePaginationParams(params: PaginationParams) {
 *   const validated = {
 *     page: 1,
 *     limit: 10,
 *     offset: 0
 *   };
 *   
 *   if (params.page !== undefined) {
 *     if (isInteger(params.page) && params.page >= 1) {
 *       validated.page = params.page;
 *     } else {
 *       throw new Error('Page must be a positive integer');
 *     }
 *   }
 *   
 *   if (params.limit !== undefined) {
 *     if (isInteger(params.limit) && params.limit >= 1 && params.limit <= 100) {
 *       validated.limit = params.limit;
 *     } else {
 *       throw new Error('Limit must be an integer between 1 and 100');
 *     }
 *   }
 *   
 *   if (params.offset !== undefined) {
 *     if (isInteger(params.offset) && params.offset >= 0) {
 *       validated.offset = params.offset;
 *     } else {
 *       throw new Error('Offset must be a non-negative integer');
 *     }
 *   }
 *   
 *   return validated;
 * }
 * ```
 *
 * @example
 * Mathematical operations:
 * ```typescript
 * function factorial(n: unknown): number {
 *   if (!isInteger(n)) {
 *     throw new Error('Factorial requires an integer input');
 *   }
 *   
 *   if (n < 0) {
 *     throw new Error('Factorial is not defined for negative integers');
 *   }
 *   
 *   if (n === 0 || n === 1) {
 *     return 1;
 *   }
 *   
 *   let result = 1;
 *   for (let i = 2; i <= n; i++) {
 *     result *= i;
 *   }
 *   
 *   return result;
 * }
 *
 * // Usage
 * console.log(factorial(5)); // 120
 * console.log(factorial(0)); // 1
 * // factorial(3.5) // throws Error: Factorial requires an integer input
 * ```
 *
 * @example
 * Configuration validation:
 * ```typescript
 * interface ServerConfig {
 *   port?: unknown;
 *   maxConnections?: unknown;
 *   timeoutMs?: unknown;
 * }
 *
 * function validateServerConfig(config: ServerConfig) {
 *   const validated: Required<ServerConfig> = {
 *     port: 3000,
 *     maxConnections: 100,
 *     timeoutMs: 30000
 *   };
 *   
 *   if (config.port !== undefined) {
 *     if (isInteger(config.port) && config.port >= 1 && config.port <= 65535) {
 *       validated.port = config.port;
 *     } else {
 *       throw new Error('Port must be an integer between 1 and 65535');
 *     }
 *   }
 *   
 *   if (config.maxConnections !== undefined) {
 *     if (isInteger(config.maxConnections) && config.maxConnections > 0) {
 *       validated.maxConnections = config.maxConnections;
 *     } else {
 *       throw new Error('Max connections must be a positive integer');
 *     }
 *   }
 *   
 *   if (config.timeoutMs !== undefined) {
 *     if (isInteger(config.timeoutMs) && config.timeoutMs > 0) {
 *       validated.timeoutMs = config.timeoutMs;
 *     } else {
 *       throw new Error('Timeout must be a positive integer in milliseconds');
 *     }
 *   }
 *   
 *   return validated;
 * }
 * ```
 *
 * @remarks
 * **Key Features:**
 * - Uses native `Number.isInteger()` for accurate detection
 * - Handles floating point precision correctly (1.0 is treated as integer)
 * - Returns `false` for `NaN`, `Infinity`, and `-Infinity`
 * - Returns `false` for non-numeric types
 * - Provides TypeScript type narrowing
 *
 * **Edge Cases Handled:**
 * - `1.0` returns `true` (mathematically an integer)
 * - `-0` returns `true` (zero is an integer)
 * - Very large numbers beyond safe integer range still return `true` if they're whole numbers
 * - String numbers like `'42'` return `false`
 *
 * **Use Cases:**
 * - Form field validation
 * - API parameter validation
 * - Array indexing validation
 * - Mathematical operation guards
 * - Configuration validation
 *
 * **Performance:** Direct delegation to native `Number.isInteger()` provides optimal performance.
 *
 * **Related Functions:**
 * - Use `Number.isSafeInteger()` for safe integer range checking
 * - Use `isNumber()` for general number type checking
 * - Use `Math.floor(n) === n` for alternative integer checking
 */
export const isInteger = Number.isInteger as (
  value?: unknown,
) => value is number;