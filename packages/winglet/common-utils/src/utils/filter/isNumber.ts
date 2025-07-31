/**
 * Determines whether a value is a number type with enhanced type safety.
 *
 * Provides reliable number type detection using native typeof check,
 * identifying all number values including integers, floats, special
 * numeric values (NaN, Infinity), and both positive and negative numbers.
 *
 * @param value - Value to test for number type
 * @returns Type-safe boolean indicating whether the value is a number
 *
 * @example
 * Basic number detection:
 * ```typescript
 * import { isNumber } from '@winglet/common-utils';
 *
 * // True cases - number type
 * console.log(isNumber(42)); // true
 * console.log(isNumber(-17)); // true
 * console.log(isNumber(3.14)); // true
 * console.log(isNumber(0)); // true
 * console.log(isNumber(-0)); // true
 * console.log(isNumber(Infinity)); // true
 * console.log(isNumber(-Infinity)); // true
 * console.log(isNumber(NaN)); // true (NaN is of type number)
 * console.log(isNumber(Number.MAX_VALUE)); // true
 * console.log(isNumber(Number.MIN_VALUE)); // true
 * console.log(isNumber(1e-10)); // true (scientific notation)
 * console.log(isNumber(0x10)); // true (hexadecimal)
 * console.log(isNumber(0b101)); // true (binary)
 * console.log(isNumber(0o77)); // true (octal)
 *
 * // False cases - not number type
 * console.log(isNumber('42')); // false (string)
 * console.log(isNumber('3.14')); // false (string)
 * console.log(isNumber(true)); // false (boolean)
 * console.log(isNumber(null)); // false
 * console.log(isNumber(undefined)); // false
 * console.log(isNumber({})); // false (object)
 * console.log(isNumber([])); // false (array)
 * console.log(isNumber(BigInt(42))); // false (bigint, not number)
 * ```
 *
 * @example
 * Form validation with number checking:
 * ```typescript
 * interface FormData {
 *   age: unknown;
 *   price: unknown;
 *   quantity: unknown;
 * }
 *
 * function validateNumericFields(formData: FormData) {
 *   const errors: string[] = [];
 *
 *   if (!isNumber(formData.age)) {
 *     errors.push('Age must be a number');
 *   } else if (isNaN(formData.age) || formData.age < 0 || formData.age > 150) {
 *     errors.push('Age must be a valid number between 0 and 150');
 *   }
 *
 *   if (!isNumber(formData.price)) {
 *     errors.push('Price must be a number');
 *   } else if (isNaN(formData.price) || formData.price < 0) {
 *     errors.push('Price must be a valid positive number');
 *   }
 *
 *   if (!isNumber(formData.quantity)) {
 *     errors.push('Quantity must be a number');
 *   } else if (!Number.isInteger(formData.quantity) || formData.quantity < 1) {
 *     errors.push('Quantity must be a positive integer');
 *   }
 *
 *   return errors;
 * }
 * ```
 *
 * @example
 * Mathematical operations with type safety:
 * ```typescript
 * function safeMath(a: unknown, b: unknown, operation: '+' | '-' | '*' | '/') {
 *   if (!isNumber(a) || !isNumber(b)) {
 *     throw new Error('Both operands must be numbers');
 *   }
 *
 *   if (isNaN(a) || isNaN(b)) {
 *     throw new Error('Cannot perform math with NaN values');
 *   }
 *
 *   if (!isFinite(a) || !isFinite(b)) {
 *     throw new Error('Cannot perform math with infinite values');
 *   }
 *
 *   // TypeScript knows a and b are numbers
 *   switch (operation) {
 *     case '+': return a + b;
 *     case '-': return a - b;
 *     case '*': return a * b;
 *     case '/':
 *       if (b === 0) throw new Error('Division by zero');
 *       return a / b;
 *   }
 * }
 *
 * // Usage
 * console.log(safeMath(10, 5, '+')); // 15
 * console.log(safeMath(10, 2, '/')); // 5
 * // safeMath('10', 5, '+') // throws Error: Both operands must be numbers
 * ```
 *
 * @example
 * API response validation:
 * ```typescript
 * interface ApiResponse {
 *   total: unknown;
 *   count: unknown;
 *   average: unknown;
 * }
 *
 * function validateApiResponse(response: ApiResponse) {
 *   const errors: string[] = [];
 *
 *   if (!isNumber(response.total)) {
 *     errors.push('Total must be a number');
 *   } else if (response.total < 0) {
 *     errors.push('Total cannot be negative');
 *   }
 *
 *   if (!isNumber(response.count)) {
 *     errors.push('Count must be a number');
 *   } else if (!Number.isInteger(response.count) || response.count < 0) {
 *     errors.push('Count must be a non-negative integer');
 *   }
 *
 *   if (!isNumber(response.average)) {
 *     errors.push('Average must be a number');
 *   } else if (isNaN(response.average)) {
 *     errors.push('Average cannot be NaN');
 *   }
 *
 *   if (errors.length > 0) {
 *     throw new Error(`API validation failed: ${errors.join(', ')}`);
 *   }
 *
 *   return response as { total: number; count: number; average: number };
 * }
 * ```
 *
 * @example
 * Array processing with number filtering:
 * ```typescript
 * function processNumericArray(data: unknown[]): {
 *   numbers: number[];
 *   validNumbers: number[];
 *   sum: number;
 *   average: number;
 * } {
 *   const numbers = data.filter(isNumber);
 *   const validNumbers = numbers.filter(n => !isNaN(n) && isFinite(n));
 *
 *   const sum = validNumbers.reduce((acc, n) => acc + n, 0);
 *   const average = validNumbers.length > 0 ? sum / validNumbers.length : 0;
 *
 *   return {
 *     numbers,
 *     validNumbers,
 *     sum,
 *     average
 *   };
 * }
 *
 * // Usage
 * const mixed = [1, '2', 3.14, 'hello', NaN, Infinity, null, 42, true];
 * const result = processNumericArray(mixed);
 * console.log(result);
 * // {
 * //   numbers: [1, 3.14, NaN, Infinity, 42],
 * //   validNumbers: [1, 3.14, 42],
 * //   sum: 46.14,
 * //   average: 15.38
 * // }
 * ```
 *
 * @example
 * Configuration validation:
 * ```typescript
 * interface ServerConfig {
 *   port?: unknown;
 *   timeout?: unknown;
 *   maxConnections?: unknown;
 *   retryDelay?: unknown;
 * }
 *
 * function validateServerConfig(config: ServerConfig) {
 *   const validated = {
 *     port: 3000,
 *     timeout: 30000,
 *     maxConnections: 100,
 *     retryDelay: 1000
 *   };
 *
 *   if (config.port !== undefined) {
 *     if (!isNumber(config.port)) {
 *       throw new Error('Port must be a number');
 *     }
 *     if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
 *       throw new Error('Port must be an integer between 1 and 65535');
 *     }
 *     validated.port = config.port;
 *   }
 *
 *   if (config.timeout !== undefined) {
 *     if (!isNumber(config.timeout)) {
 *       throw new Error('Timeout must be a number');
 *     }
 *     if (config.timeout <= 0) {
 *       throw new Error('Timeout must be positive');
 *     }
 *     validated.timeout = config.timeout;
 *   }
 *
 *   return validated;
 * }
 * ```
 *
 * @example
 * Statistical calculations:
 * ```typescript
 * function calculateStatistics(values: unknown[]) {
 *   const numbers = values.filter(isNumber).filter(n => !isNaN(n) && isFinite(n));
 *
 *   if (numbers.length === 0) {
 *     return { error: 'No valid numbers provided' };
 *   }
 *
 *   const sum = numbers.reduce((acc, n) => acc + n, 0);
 *   const mean = sum / numbers.length;
 *   const variance = numbers.reduce((acc, n) => acc + (n - mean) ** 2, 0) / numbers.length;
 *   const stdDev = Math.sqrt(variance);
 *
 *   const sorted = [...numbers].sort((a, b) => a - b);
 *   const median = sorted.length % 2 === 0
 *     ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
 *     : sorted[Math.floor(sorted.length / 2)];
 *
 *   return {
 *     count: numbers.length,
 *     sum,
 *     mean,
 *     median,
 *     variance,
 *     standardDeviation: stdDev,
 *     min: Math.min(...numbers),
 *     max: Math.max(...numbers)
 *   };
 * }
 * ```
 *
 * @remarks
 * **Important Note about NaN:**
 * - `NaN` is of type `number` in JavaScript, so `isNumber(NaN)` returns `true`
 * - Use `isNaN()` or `Number.isNaN()` to check for NaN values specifically
 * - Use `isFinite()` to exclude both NaN and Infinity values
 *
 * **Special Number Values:**
 * - `Infinity` and `-Infinity` are valid numbers
 * - `NaN` is a valid number type (though not a valid numeric value)
 * - `-0` is treated as a number (and equals `0`)
 *
 * **Use Cases:**
 * - Form field validation
 * - API parameter validation
 * - Mathematical operation guards
 * - Array filtering and processing
 * - Configuration validation
 * - Statistical calculations
 *
 * **Performance:** Direct typeof check provides optimal performance.
 *
 * **Related Functions:**
 * - Use `isInteger()` for integer-specific checking
 * - Use `isNaN()` or `Number.isNaN()` for NaN detection
 * - Use `isFinite()` to exclude NaN and Infinity
 * - Use `Number.isSafeInteger()` for safe integer range checking
 */
export const isNumber = (value?: unknown): value is number =>
  typeof value === 'number';
