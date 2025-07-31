/**
 * Determines whether a value is nil (null or undefined) with enhanced type safety.
 *
 * Provides reliable nil detection using loose equality check, identifying
 * both null and undefined values in a single operation. Uses the `==` operator
 * which treats null and undefined as equivalent.
 *
 * @param value - Value to test for nil (null or undefined)
 * @returns Type-safe boolean indicating whether the value is null or undefined
 *
 * @example
 * Basic nil detection:
 * ```typescript
 * import { isNil } from '@winglet/common-utils';
 *
 * // True cases - nil values
 * console.log(isNil(null)); // true
 * console.log(isNil(undefined)); // true
 * console.log(isNil(void 0)); // true (undefined)
 *
 * // False cases - non-nil values
 * console.log(isNil(0)); // false (falsy but not nil)
 * console.log(isNil('')); // false (falsy but not nil)
 * console.log(isNil(false)); // false (falsy but not nil)
 * console.log(isNil(NaN)); // false (falsy but not nil)
 * console.log(isNil({})); // false (object)
 * console.log(isNil([])); // false (array)
 * console.log(isNil(new Date())); // false (Date instance)
 * console.log(isNil(new Error())); // false (Error instance)
 * ```
 *
 * @example
 * Optional parameter handling:
 * ```typescript
 * function processValue(value?: string | null) {
 *   if (isNil(value)) {
 *     console.log('No value provided, using default');
 *     return 'default-value';
 *   }
 *
 *   // TypeScript knows value is string (not null or undefined)
 *   return value.toUpperCase();
 * }
 *
 * // Usage
 * console.log(processValue('hello')); // 'HELLO'
 * console.log(processValue(null)); // 'default-value'
 * console.log(processValue(undefined)); // 'default-value'
 * console.log(processValue()); // 'default-value'
 * ```
 *
 * @example
 * API response validation:
 * ```typescript
 * interface ApiResponse {
 *   data?: any;
 *   error?: string;
 * }
 *
 * function handleApiResponse(response: ApiResponse) {
 *   if (isNil(response.data)) {
 *     if (isNil(response.error)) {
 *       throw new Error('Invalid API response: no data or error information');
 *     }
 *     throw new Error(`API Error: ${response.error}`);
 *   }
 *
 *   return response.data;
 * }
 * ```
 *
 * @example
 * Form field validation:
 * ```typescript
 * interface FormData {
 *   email?: string | null;
 *   name?: string | null;
 *   age?: number | null;
 * }
 *
 * function validateRequiredFields(formData: FormData) {
 *   const errors: string[] = [];
 *
 *   if (isNil(formData.email)) {
 *     errors.push('Email is required');
 *   }
 *
 *   if (isNil(formData.name)) {
 *     errors.push('Name is required');
 *   }
 *
 *   if (isNil(formData.age)) {
 *     errors.push('Age is required');
 *   }
 *
 *   return {
 *     isValid: errors.length === 0,
 *     errors
 *   };
 * }
 * ```
 *
 * @example
 * Array filtering:
 * ```typescript
 * function removeNilValues<T>(array: (T | null | undefined)[]): T[] {
 *   return array.filter((item): item is T => !isNil(item));
 * }
 *
 * // Usage
 * const mixed = [1, null, 'hello', undefined, true, null, 42];
 * const filtered = removeNilValues(mixed); // [1, 'hello', true, 42]
 * console.log('Filtered array:', filtered);
 * ```
 *
 * @example
 * Object property checking:
 * ```typescript
 * function extractNonNilProperties(obj: Record<string, any>) {
 *   const result: Record<string, any> = {};
 *
 *   for (const [key, value] of Object.entries(obj)) {
 *     if (!isNil(value)) {
 *       result[key] = value;
 *     }
 *   }
 *
 *   return result;
 * }
 *
 * // Usage
 * const data = {
 *   name: 'John',
 *   age: null,
 *   email: 'john@example.com',
 *   phone: undefined,
 *   active: false
 * };
 *
 * const clean = extractNonNilProperties(data);
 * // { name: 'John', email: 'john@example.com', active: false }
 * ```
 *
 * @example
 * Default value assignment:
 * ```typescript
 * function withDefaults<T>(value: T | null | undefined, defaultValue: T): T {
 *   return isNil(value) ? defaultValue : value;
 * }
 *
 * // Usage
 * const config = {
 *   timeout: withDefaults(userConfig?.timeout, 5000),
 *   retries: withDefaults(userConfig?.retries, 3),
 *   debug: withDefaults(userConfig?.debug, false)
 * };
 * ```
 *
 * @remarks
 * **Important Technical Details:**
 * - Uses loose equality (`==`) which treats null and undefined as equivalent
 * - More concise than `value === null || value === undefined`
 * - Provides TypeScript type narrowing to exclude null and undefined
 * - Part of functional programming patterns for handling optional values
 *
 * **Use Cases:**
 * - Optional parameter validation
 * - API response validation
 * - Form field validation
 * - Array/object filtering
 * - Default value assignment
 * - Type guard for optional properties
 *
 * **Performance:**
 * - Single comparison operation with loose equality
 * - More efficient than multiple strict comparisons
 * - Optimized by JavaScript engines
 *
 * **Related Functions:**
 * - Use `isNotNil()` for the inverse check
 * - Use `isNull()` for null-only checking
 * - Use `isUndefined()` for undefined-only checking
 * - Use `!!value` for truthy/falsy checking
 */
export const isNil = (value?: unknown): value is null | undefined =>
  value == null;
