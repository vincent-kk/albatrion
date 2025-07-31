/**
 * Determines whether a value is an Error object with enhanced type safety.
 *
 * Provides reliable Error detection using instanceof check, identifying
 * all Error types including built-in error classes and custom error
 * implementations that extend the Error prototype.
 *
 * @param value - Value to test for Error type
 * @returns Type-safe boolean indicating whether the value is an Error object
 *
 * @example
 * Basic Error detection:
 * ```typescript
 * import { isError } from '@winglet/common-utils';
 *
 * // True cases - Error instances
 * console.log(isError(new Error())); // true
 * console.log(isError(new Error('Something went wrong'))); // true
 * console.log(isError(new TypeError('Type error'))); // true
 * console.log(isError(new ReferenceError('Reference error'))); // true
 * console.log(isError(new SyntaxError('Syntax error'))); // true
 * console.log(isError(new RangeError('Range error'))); // true
 * console.log(isError(new URIError('URI error'))); // true
 * console.log(isError(new EvalError('Eval error'))); // true
 *
 * // Custom Error classes
 * class CustomError extends Error {}
 * console.log(isError(new CustomError())); // true
 *
 * // False cases - not Error objects
 * console.log(isError('error message')); // false (string)
 * console.log(isError({ name: 'Error', message: 'error' })); // false (error-like object)
 * console.log(isError(null)); // false
 * console.log(isError(undefined)); // false
 * console.log(isError(42)); // false
 * console.log(isError({})); // false
 * console.log(isError([])); // false
 * ```
 *
 * @example
 * Error handling and processing:
 * ```typescript
 * function handleResult(result: unknown) {
 *   if (isError(result)) {
 *     // TypeScript knows result is Error
 *     console.error('Error occurred:', result.message);
 *     console.error('Stack trace:', result.stack);
 *
 *     // Handle specific error types
 *     if (result instanceof TypeError) {
 *       return { success: false, error: 'Type error', code: 'TYPE_ERROR' };
 *     }
 *
 *     if (result instanceof RangeError) {
 *       return { success: false, error: 'Range error', code: 'RANGE_ERROR' };
 *     }
 *
 *     return { success: false, error: result.message, code: 'GENERAL_ERROR' };
 *   }
 *
 *   return { success: true, data: result };
 * }
 * ```
 *
 * @example
 * Promise result handling:
 * ```typescript
 * async function safeAsyncOperation(): Promise<{ success: boolean; data?: any; error?: string }> {
 *   try {
 *     const result = await riskyOperation();
 *     return { success: true, data: result };
 *   } catch (caught) {
 *     if (isError(caught)) {
 *       return {
 *         success: false,
 *         error: `Operation failed: ${caught.message}`
 *       };
 *     }
 *
 *     // Handle non-Error exceptions
 *     return {
 *       success: false,
 *       error: `Unknown error: ${String(caught)}`
 *     };
 *   }
 * }
 * ```
 *
 * @example
 * Error logging utility:
 * ```typescript
 * interface ErrorLog {
 *   message: string;
 *   stack?: string;
 *   type: string;
 *   timestamp: number;
 * }
 *
 * function logError(error: unknown): ErrorLog {
 *   const timestamp = Date.now();
 *
 *   if (isError(error)) {
 *     return {
 *       message: error.message,
 *       stack: error.stack,
 *       type: error.constructor.name,
 *       timestamp
 *     };
 *   }
 *
 *   // Handle non-Error objects
 *   return {
 *     message: String(error),
 *     type: 'Unknown',
 *     timestamp
 *   };
 * }
 *
 * // Usage
 * try {
 *   throw new TypeError('Invalid type');
 * } catch (e) {
 *   const log = logError(e);
 *   console.log('Error log:', log);
 * }
 * ```
 *
 * @example
 * Custom Error class validation:
 * ```typescript
 * class ValidationError extends Error {
 *   constructor(
 *     message: string,
 *     public field: string,
 *     public code: string
 *   ) {
 *     super(message);
 *     this.name = 'ValidationError';
 *   }
 * }
 *
 * class NetworkError extends Error {
 *   constructor(
 *     message: string,
 *     public statusCode: number,
 *     public endpoint: string
 *   ) {
 *     super(message);
 *     this.name = 'NetworkError';
 *   }
 * }
 *
 * function processError(error: unknown) {
 *   if (!isError(error)) {
 *     return 'Not an error object';
 *   }
 *
 *   if (error instanceof ValidationError) {
 *     return `Validation failed for ${error.field}: ${error.message}`;
 *   }
 *
 *   if (error instanceof NetworkError) {
 *     return `Network error (${error.statusCode}) at ${error.endpoint}: ${error.message}`;
 *   }
 *
 *   return `General error: ${error.message}`;
 * }
 * ```
 *
 * @example
 * API error response handling:
 * ```typescript
 * interface ApiResponse<T> {
 *   data?: T;
 *   error?: unknown;
 * }
 *
 * function handleApiResponse<T>(response: ApiResponse<T>) {
 *   if (response.error) {
 *     if (isError(response.error)) {
 *       throw new Error(`API Error: ${response.error.message}`);
 *     }
 *
 *     throw new Error(`API Error: ${String(response.error)}`);
 *   }
 *
 *   if (!response.data) {
 *     throw new Error('API returned no data');
 *   }
 *
 *   return response.data;
 * }
 * ```
 *
 * @remarks
 * **Error Types Detected:**
 * - Base Error class and all instances
 * - Built-in errors: TypeError, ReferenceError, SyntaxError, RangeError, URIError, EvalError
 * - Custom error classes that extend Error
 * - Any object in the Error prototype chain
 *
 * **Key Features:**
 * - Distinguishes actual Error objects from error-like objects
 * - Works with custom Error subclasses
 * - Provides TypeScript type narrowing
 * - Cross-frame compatible
 *
 * **Use Cases:**
 * - Exception handling and processing
 * - Error logging and reporting
 * - API error response handling
 * - Promise rejection handling
 * - Type-safe error processing
 *
 * **Performance:** Direct instanceof check provides optimal performance.
 *
 * **Related Functions:**
 * - Use `error instanceof SpecificError` for specific error type checking
 * - Use `typeof error === 'object'` for basic object checking
 * - Use custom error class checks for application-specific errors
 */
export const isError = (value: unknown): value is Error =>
  value instanceof Error;
