/**
 * Determines whether a value is not nil (neither null nor undefined) with enhanced type safety.
 *
 * Provides reliable non-nil detection using loose inequality check, serving as
 * a type guard to exclude null and undefined values. This is the inverse of
 * `isNil()` and is particularly useful for filtering and type narrowing.
 *
 * @template T - The type of the non-nil value
 * @param value - Value to test for non-nil (not null and not undefined)
 * @returns Type-safe boolean indicating whether the value is neither null nor undefined
 *
 * @example
 * Basic non-nil detection:
 * ```typescript
 * import { isNotNil } from '@winglet/common-utils';
 *
 * // True cases - non-nil values
 * console.log(isNotNil(0)); // true (falsy but not nil)
 * console.log(isNotNil('')); // true (falsy but not nil)
 * console.log(isNotNil(false)); // true (falsy but not nil)
 * console.log(isNotNil(NaN)); // true (falsy but not nil)
 * console.log(isNotNil({})); // true
 * console.log(isNotNil([])); // true
 * console.log(isNotNil('hello')); // true
 * console.log(isNotNil(42)); // true
 * console.log(isNotNil(new Date())); // true
 * 
 * // False cases - nil values
 * console.log(isNotNil(null)); // false
 * console.log(isNotNil(undefined)); // false
 * console.log(isNotNil(void 0)); // false (undefined)
 * ```
 *
 * @example
 * Array filtering with type safety:
 * ```typescript
 * function filterNonNilValues<T>(array: (T | null | undefined)[]): T[] {
 *   return array.filter(isNotNil);
 * }
 *
 * // Usage
 * const mixed = [1, null, 'hello', undefined, true, null, 42, ''];
 * const filtered = filterNonNilValues(mixed); // [1, 'hello', true, 42, '']
 * 
 * // TypeScript knows filtered is T[] (without null | undefined)
 * filtered.forEach(item => {
 *   // No need for null checks here
 *   console.log(item.toString()); // Safe to call methods
 * });
 * ```
 *
 * @example
 * Optional chaining replacement:
 * ```typescript
 * interface User {
 *   profile?: {
 *     avatar?: {
 *       url?: string;
 *     } | null;
 *   } | null;
 * }
 *
 * function getAvatarUrl(user: User): string | null {
 *   if (isNotNil(user.profile) && 
 *       isNotNil(user.profile.avatar) && 
 *       isNotNil(user.profile.avatar.url)) {
 *     // TypeScript knows all values are non-nil
 *     return user.profile.avatar.url;
 *   }
 *   
 *   return null;
 * }
 * ```
 *
 * @example
 * Form field processing:
 * ```typescript
 * interface FormData {
 *   email?: string | null;
 *   name?: string | null;
 *   age?: number | null;
 *   preferences?: string[] | null;
 * }
 *
 * function processFormData(formData: FormData) {
 *   const processedFields: Record<string, any> = {};
 *   
 *   if (isNotNil(formData.email)) {
 *     // TypeScript knows email is string (not null or undefined)
 *     processedFields.email = formData.email.toLowerCase().trim();
 *   }
 *   
 *   if (isNotNil(formData.name)) {
 *     processedFields.name = formData.name.trim();
 *   }
 *   
 *   if (isNotNil(formData.age)) {
 *     processedFields.age = Math.max(0, formData.age);
 *   }
 *   
 *   if (isNotNil(formData.preferences)) {
 *     processedFields.preferences = formData.preferences.filter(p => p.length > 0);
 *   }
 *   
 *   return processedFields;
 * }
 * ```
 *
 * @example
 * API response processing:
 * ```typescript
 * interface ApiResponse {
 *   data?: any[] | null;
 *   meta?: {
 *     total?: number | null;
 *     page?: number | null;
 *   } | null;
 * }
 *
 * function processApiResponse(response: ApiResponse) {
 *   const result = {
 *     items: [] as any[],
 *     pagination: {
 *       total: 0,
 *       page: 1
 *     }
 *   };
 *   
 *   if (isNotNil(response.data)) {
 *     // TypeScript knows data is any[] (not null or undefined)
 *     result.items = response.data.map(item => ({ ...item, processed: true }));
 *   }
 *   
 *   if (isNotNil(response.meta)) {
 *     if (isNotNil(response.meta.total)) {
 *       result.pagination.total = response.meta.total;
 *     }
 *     
 *     if (isNotNil(response.meta.page)) {
 *       result.pagination.page = response.meta.page;
 *     }
 *   }
 *   
 *   return result;
 * }
 * ```
 *
 * @example
 * Object property extraction:
 * ```typescript
 * function extractDefinedProperties<T extends Record<string, any>>(obj: T) {
 *   const result: Partial<T> = {};
 *   
 *   for (const [key, value] of Object.entries(obj)) {
 *     if (isNotNil(value)) {
 *       // TypeScript knows value is non-nil
 *       result[key as keyof T] = value;
 *     }
 *   }
 *   
 *   return result;
 * }
 *
 * // Usage
 * const config = {
 *   apiUrl: 'https://api.example.com',
 *   timeout: null,
 *   retries: 3,
 *   debug: undefined,
 *   version: '1.0.0'
 * };
 *
 * const definedConfig = extractDefinedProperties(config);
 * // { apiUrl: 'https://api.example.com', retries: 3, version: '1.0.0' }
 * ```
 *
 * @example
 * Conditional operations:
 * ```typescript
 * function safeOperation<T, R>(
 *   value: T | null | undefined,
 *   operation: (val: T) => R
 * ): R | null {
 *   if (isNotNil(value)) {
 *     // TypeScript knows value is T (not null or undefined)
 *     return operation(value);
 *   }
 *   
 *   return null;
 * }
 *
 * // Usage
 * const result = safeOperation('hello world', str => str.toUpperCase());
 * console.log(result); // 'HELLO WORLD'
 *
 * const nullResult = safeOperation(null, str => str.toUpperCase());
 * console.log(nullResult); // null
 * ```
 *
 * @remarks
 * **Type Safety Benefits:**
 * - Provides TypeScript type narrowing to exclude null and undefined
 * - Enables safe method calls without additional null checks
 * - Works as array filter predicate with proper type inference
 * - Generic type parameter preserves original type information
 *
 * **Technical Implementation:**
 * - Uses loose inequality (`!=`) for efficient null/undefined checking
 * - Inverse of `isNil()` with identical performance characteristics
 * - Single comparison operation optimized by JavaScript engines
 *
 * **Use Cases:**
 * - Array filtering to remove nil values
 * - Type guards for optional properties
 * - Conditional processing of nullable values
 * - API response validation
 * - Form data processing
 * - Safe method invocation
 *
 * **Performance:** Single comparison with loose inequality provides optimal performance.
 *
 * **Related Functions:**
 * - Use `isNil()` for the inverse check (null or undefined)
 * - Use `isNull()` for null-only checking
 * - Use `isUndefined()` for undefined-only checking
 * - Use `Boolean(value)` for truthy checking
 */
export const isNotNil = <T>(value: T | null | undefined): value is T =>
  value != null;